import os
import re
import redis
import hashlib
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv

# Load the salt from your .env file
load_dotenv()

app = FastAPI(title="SA Voting API")

# Setup Redis (Deduplication Layer)
r = redis.Redis(
    host=os.getenv("REDIS_HOST", "localhost"), 
    port=6379, 
    decode_responses=True
)
SALT = os.getenv("SECRET_SALT", "default_salt")

class Vote(BaseModel):
    id_number: str
    candidate: str

def is_valid_sa_id(id_num: str) -> bool:
    if not re.match(r"^\d{13}$", id_num): return False
    digits = [int(d) for d in id_num]
    total = 0
    for i, digit in enumerate(reversed(digits[:-1])):
        if i % 2 == 0:
            val = digit * 2
            total += val if val < 10 else val - 9
        else:
            total += digit
    return (10 - (total % 10)) % 10 == digits[-1]

@app.post("/vote")
async def cast_vote(vote: Vote):
    # 1. Validation
    if not is_valid_sa_id(vote.id_number):
        raise HTTPException(status_code=400, detail="Invalid SA ID")
    
    # 2. Hashing (Privacy/POPIA Compliance)
    voter_hash = hashlib.sha256((vote.id_number + SALT).encode()).hexdigest()
    
    # 3. Deduplication check
    if r.get(f"voter:{voter_hash}"):
        raise HTTPException(status_code=403, detail="This ID has already voted")
    
    # 4. Record Vote
    r.set(f"voter:{voter_hash}", "1")
    r.incr(f"party:{vote.candidate}")
    
    return {"status": "success", "candidate": vote.candidate}

@app.get("/results")
async def get_results():
    keys = r.keys("party:*")
    tally = {k.split(":")[1]: r.get(k) for k in keys}
    return {"tally": tally}