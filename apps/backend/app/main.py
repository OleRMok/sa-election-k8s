import os
import re
import redis
import hashlib
import logging
from pathlib import Path
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv

# 1. LOGGING SETUP
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("sa-voting-api")

# 2. ENVIRONMENT & PATHS
# Look for the .env at the project root (4 levels up from this file locally)
# In Docker, this file won't exist, so we use load_dotenv's fail-safe behaviour
BASE_DIR = Path(__file__).resolve().parents[3]
env_path = BASE_DIR / ".env"

if env_path.exists():
    load_dotenv(dotenv_path=env_path)
    logger.info(f"Loaded config from {env_path}")
else:
    load_dotenv() # Fallback to system environment variables (Docker/K8s)
    logger.info("No .env file found; using system environment variables.")

app = FastAPI(title="SA Voting API")

# 3. CONFIGURATION (with defaults)
REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))
SALT = os.getenv("SECRET_SALT", "default_unsalt_change_me_in_prod")

# Setup Redis connection pool (better for microservices)
pool = redis.ConnectionPool(host=REDIS_HOST, port=REDIS_PORT, decode_responses=True)
r = redis.Redis(connection_pool=pool)

# 4. MODELS & UTILS
class Vote(BaseModel):
    id_number: str
    candidate: str

def is_valid_sa_id(id_num: str) -> bool:
    """Validates South African ID using the Luhn Algorithm."""
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

# 5. ROUTES
@app.post("/vote")
async def cast_vote(vote: Vote):
    # Validation
    if not is_valid_sa_id(vote.id_number):
        logger.warning(f"Invalid ID attempt: {vote.id_number}")
        raise HTTPException(status_code=400, detail="Invalid SA ID")
    
    # Hashing (Privacy/POPIA Compliance)
    voter_hash = hashlib.sha256((vote.id_number + SALT).encode()).hexdigest()
    
    # Deduplication check
    if r.get(f"voter:{voter_hash}"):
        logger.info("Duplicate vote attempted.")
        raise HTTPException(status_code=403, detail="This ID has already voted")
    
    # Record Vote (Atomic operations)
    try:
        r.set(f"voter:{voter_hash}", "1")
        r.incr(f"party:{vote.candidate}")
        return {"status": "success", "candidate": vote.candidate}
    except redis.RedisError as e:
        logger.error(f"Redis error: {e}")
        raise HTTPException(status_code=500, detail="Database connection error")

@app.get("/results")
async def get_results():
    keys = r.keys("party:*")
    tally = {k.split(":")[1]: r.get(k) for k in keys}
    return {"tally": tally}

@app.get("/health")
async def health_check():
    """Liveness probe for Kubernetes"""
    try:
        r.ping()
        return {"status": "healthy", "redis": "connected"}
    except Exception:
        raise HTTPException(status_code=500, detail="Unhealthy")