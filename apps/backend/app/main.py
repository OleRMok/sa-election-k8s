import os
import re
import redis
import hashlib
import logging
import sys
from pathlib import Path
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware

# 1. LOGGING SETUP
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("sa-voting-api")

# 2. ENVIRONMENT & PATHS
# In Docker, .env is injected via env_file in compose — load_dotenv() is a local dev fallback
BASE_DIR = Path(__file__).resolve().parent
env_path = BASE_DIR / ".env"

if env_path.exists():
    load_dotenv(dotenv_path=env_path)
    logger.info(f"✅ Loaded config from {env_path}")
else:
    load_dotenv()
    logger.info("🚀 Container Mode: Using system environment variables.")

# 3. CRITICAL SECURITY CHECK
# Fail-fast: Stop the server if secrets aren't loaded correctly
SALT = os.getenv("SECRET_SALT")
if not SALT or SALT == "default_secret_keep_it_safe":
    logger.critical("❌ FATAL: SECRET_SALT is not set or is insecure! System halting.")
    sys.exit(1)

app = FastAPI(title="SA National Election API - Secure V2")

# 4. DYNAMIC CORS SETUP
# Pulls from .env (e.g., "http://localhost:8080,http://localhost:3000")
# Strip whitespace from each origin to avoid subtle CORS bugs
origins = [o.strip() for o in os.getenv("ALLOWED_ORIGINS", "http://localhost:8080").split(",")]
logger.info(f"🌐 CORS Allowed Origins: {origins}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# 5. CONFIGURATION & REDIS POOL
REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))

pool = redis.ConnectionPool(
    host=REDIS_HOST,
    port=REDIS_PORT,
    decode_responses=True,
    socket_timeout=5
)
r = redis.Redis(connection_pool=pool)

# 6. MODELS
class Vote(BaseModel):
    id_number: str
    province: str
    municipality: str
    ward: str
    national_party: str
    regional_candidate: str
    provincial_candidate: str

def is_valid_sa_id(id_num: str) -> bool:
    """Luhn Algorithm for South African ID Validation"""
    if not re.match(r"^\d{13}$", id_num):
        return False
    digits = [int(d) for d in id_num]
    total = 0
    for i, digit in enumerate(reversed(digits[:-1])):
        if i % 2 == 0:
            val = digit * 2
            total += val if val < 10 else val - 9
        else:
            total += digit
    return (10 - (total % 10)) % 10 == digits[-1]

# 7. ROUTES

@app.get("/")
async def root():
    """Root route — confirms the API is alive."""
    return {"message": "SA National Election API is running", "version": "2.0"}

@app.post("/vote")
async def cast_vote(vote: Vote):
    # Security: ID Validation
    if not is_valid_sa_id(vote.id_number):
        logger.warning(f"⚠️ Invalid ID Attempt: {vote.id_number}")
        raise HTTPException(status_code=400, detail="Invalid SA ID format")

    # Privacy: POPIA-Compliant Hashing using the .env SALT
    voter_hash = hashlib.sha256((vote.id_number + SALT).encode()).hexdigest()
    voter_key = f"voter:{voter_hash}"

    # Atomic Deduplication (SET if Not Exists)
    already_voted = r.set(voter_key, "1", nx=True)

    if not already_voted:
        logger.info(f"🚫 Duplicate Vote Blocked: {voter_hash[:10]}")
        raise HTTPException(status_code=403, detail="This ID has already cast a ballot.")

    try:
        # Atomic Tallying (All 3 ballots must succeed together)
        pipe = r.pipeline()
        pipe.incr(f"party:{vote.national_party}")
        pipe.incr(f"regional:{vote.province}:{vote.regional_candidate}")
        pipe.incr(f"provincial:{vote.province}:{vote.provincial_candidate}")
        pipe.execute()

        logger.info(f"🗳️ Vote Success: {vote.province} / Ward {vote.ward}")
        return {"status": "success", "receipt": voter_hash[:10]}

    except redis.RedisError as e:
        # Cleanup: If tally fails, let the voter try again
        r.delete(voter_key)
        logger.error(f"❌ Database Transaction Error: {e}")
        raise HTTPException(status_code=500, detail="Internal tallying error. Please try again.")

@app.get("/results")
async def get_results():
    """Returns a full snapshot of all tallies — national, regional, and provincial."""
    national_tally = {}
    for key in r.scan_iter("party:*"):
        party_name = key.split(":")[1]
        count = r.get(key)
        national_tally[party_name] = int(count) if count else 0

    regional_tally = {}
    for key in r.scan_iter("regional:*"):
        _, province, candidate = key.split(":", 2)
        regional_tally.setdefault(province, {})[candidate] = int(r.get(key) or 0)

    provincial_tally = {}
    for key in r.scan_iter("provincial:*"):
        _, province, candidate = key.split(":", 2)
        provincial_tally.setdefault(province, {})[candidate] = int(r.get(key) or 0)

    return {
        "national_tally": national_tally,
        "regional_tally": regional_tally,
        "provincial_tally": provincial_tally,
    }

@app.get("/health")
async def health_check():
    try:
        r.ping()
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        logger.critical(f"💀 Health check failed: {e}")
        raise HTTPException(status_code=500, detail="Service Unhealthy")