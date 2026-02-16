import os
import re
import redis
import hashlib
from pathlib import Path
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv

# 1. SETUP PATHS & LOAD ENV
# We go up three levels: app -> backend -> apps -> root
BASE_DIR = Path(__file__).resolve().parents[3]
load_dotenv(dotenv_path=BASE_DIR / ".env")

app = FastAPI(title="SA Voting API")

# 2. CONFIGURATION
# Pulling from .env with sensible defaults for local development
REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))
SALT = os.getenv("SECRET_SALT", "default_salt_change_me")

# Setup Redis
r = redis.Redis(
    host=REDIS_HOST, 
    port=REDIS_PORT, 
    decode_responses=True
)

# 3. MODELS & UTILS
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

# 4. ROUTES
@app.post("/vote")
async def cast_vote(vote: Vote):
    # Validation
    if not is_valid_sa_id(vote.id_number):
        raise HTTPException(status_code=400, detail="Invalid SA ID")
    
    # Hashing (Privacy/POPIA Compliance)
    # Using the SALT from .env to ensure IDs aren't stored in plain text
    voter_hash = hashlib.sha256((vote.id_number + SALT).encode()).hexdigest()
    
    # Deduplication check via Redis
    if r.get(f"voter:{voter_hash}"):
        raise HTTPException(status_code=403, detail="This ID has already voted")
    
    # Record Vote (Atomic operations)
    r.set(f"voter:{voter_hash}", "1")
    r.incr(f"party:{vote.candidate}")
    
    return {"status": "success", "candidate": vote.candidate}

@app.get("/results")
async def get_results():
    keys = r.keys("party:*")
    tally = {k.split(":")[1]: r.get(k) for k in keys}
    return {"tally": tally}

@app.get("/health")
async def health_check():
    """Useful for Kubernetes Liveness/Readiness probes"""
    try:
        r.ping()
        return {"status": "healthy", "redis": "connected"}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Redis connection failed")