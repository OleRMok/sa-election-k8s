import os
import re
import redis
import hashlib
import logging
from pathlib import Path
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware

# 1. LOGGING SETUP
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("sa-voting-api")

# 2. ENVIRONMENT & PATHS
try:
    BASE_DIR = Path(__file__).resolve().parents[3]
    env_path = BASE_DIR / ".env"
except IndexError:
    env_path = None

if env_path and env_path.exists():
    load_dotenv(dotenv_path=env_path)
    logger.info(f" Loaded config from {env_path}")
else:
    load_dotenv() 
    logger.info(" Container Mode: Using system environment variables.")

app = FastAPI(title="SA National Election API")

# 3. CORS SETUP (Essential for Lovable integration)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, change to your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 4. CONFIGURATION
REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))
SALT = os.getenv("SECRET_SALT", "change_me_for_security")

pool = redis.ConnectionPool(host=REDIS_HOST, port=REDIS_PORT, decode_responses=True)
r = redis.Redis(connection_pool=pool)

# 5. MODELS 
class Vote(BaseModel):
    id_number: str
    province: str
    municipality: str
    ward: str
    # The Three Ballots
    national_party: str
    regional_candidate: str
    provincial_candidate: str

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

# 6. ROUTES
@app.post("/vote")
async def cast_vote(vote: Vote):
    # Validation
    if not is_valid_sa_id(vote.id_number):
        logger.warning(f"Invalid ID: {vote.id_number}")
        raise HTTPException(status_code=400, detail="Invalid SA ID")
    
    # Hashing (Privacy)
    voter_hash = hashlib.sha256((vote.id_number + SALT).encode()).hexdigest()
    
    # Deduplication
    if r.get(f"voter:{voter_hash}"):
        raise HTTPException(status_code=403, detail="Already Voted")
    
    try:
        # Atomic Transaction Simulation
        r.set(f"voter:{voter_hash}", "1")
        
        # Primary Tally: National Ballot
        r.incr(f"party:{vote.national_party}")
        
        # Secondary Tallies (Regional/Provincial)
        r.incr(f"regional:{vote.province}:{vote.regional_candidate}")
        
        logger.info(f"Success: Vote recorded for {vote.province} / Ward {vote.ward}")
        return {"status": "success", "receipt": voter_hash[:10]}
    except redis.RedisError:
        raise HTTPException(status_code=500, detail="Database error")

@app.get("/results")
async def get_results():
    # Fetch national party tallies
    keys = r.keys("party:*")
    tally = {k.split(":")[1]: int(r.get(k)) for k in keys}
    return {"tally": tally}

@app.get("/health")
async def health_check():
    try:
        r.ping()
        return {"status": "healthy", "redis": "connected"}
    except:
        raise HTTPException(status_code=500, detail="Unhealthy")