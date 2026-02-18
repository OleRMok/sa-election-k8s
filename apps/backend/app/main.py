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
BASE_DIR = Path(__file__).resolve().parent
env_path = BASE_DIR / ".env"

if env_path.exists():
    load_dotenv(dotenv_path=env_path)
    logger.info(f" Loaded config from {env_path}")
else:
    load_dotenv()
    logger.info(" Container Mode: Using system environment variables.")

# 3. CRITICAL SECURITY CHECK
SALT = os.getenv("SECRET_SALT")
if not SALT or SALT == "default_secret_keep_it_safe":
    logger.critical(" FATAL: SECRET_SALT is not set or is insecure! System halting.")
    sys.exit(1)

app = FastAPI(title="SA National Election API - Secure V2.1 (Optimized)")

# 4. DYNAMIC CORS SETUP
origins = [o.strip() for o in os.getenv("ALLOWED_ORIGINS", "http://localhost:8080").split(",")]
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

@app.post("/vote")
async def cast_vote(vote: Vote):
    if not is_valid_sa_id(vote.id_number):
        logger.warning(f" Invalid ID Attempt: {vote.id_number}")
        raise HTTPException(status_code=400, detail="Invalid SA ID format")

    voter_hash = hashlib.sha256((vote.id_number + SALT).encode()).hexdigest()
    voter_key = f"voter:{voter_hash}"

    # Atomic Deduplication
    already_voted = r.set(voter_key, "1", nx=True)
    if not already_voted:
        raise HTTPException(status_code=403, detail="This ID has already cast a ballot.")

    try:
        # Optimization: Use HINCRBY inside a pipeline for better performance
        pipe = r.pipeline()
        # Results are now organized into three clean hashes
        pipe.hincrby("results:national", vote.national_party, 1)
        pipe.hincrby(f"results:regional:{vote.province}", vote.regional_candidate, 1)
        pipe.hincrby(f"results:provincial:{vote.province}", vote.provincial_candidate, 1)
        pipe.execute()

        logger.info(f" Vote Success for: {voter_hash[:10]}")
        return {"status": "success", "receipt": voter_hash[:10]}

    except redis.RedisError as e:
        r.delete(voter_key)
        logger.error(f" Redis Transaction Error: {e}")
        raise HTTPException(status_code=500, detail="Internal tallying error.")

@app.get("/results")
async def get_results():
    """Returns the full tally organized by category using HGETALL for maximum speed."""
    # Fetching entire hashes in one go is much more efficient than scanning
    national = r.hgetall("results:national")
    
    # Logic to fetch all provincial and regional results
    provincial = {}
    regional = {}
    
    # We still scan for provincial/regional because they are split by province name
    for key in r.scan_iter("results:provincial:*"):
        province = key.split(":")[2]
        provincial[province] = r.hgetall(key)
        
    for key in r.scan_iter("results:regional:*"):
        province = key.split(":")[2]
        regional[province] = r.hgetall(key)

    return {
        "national_tally": {k: int(v) for k, v in national.items()},
        "provincial_tally": provincial,
        "regional_tally": regional
    }

@app.get("/health")
async def health_check():
    r.ping()
    return {"status": "healthy", "database": "connected"}