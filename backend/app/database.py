import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL")

if not MONGODB_URL:
    raise ValueError("MONGODB_URL is not set in the .env file")

client = MongoClient(MONGODB_URL, serverSelectionTimeoutMS=5000)
db = client["KnowledgeForge"]
users = db["users"]