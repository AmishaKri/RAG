from pymongo import MongoClient
from pymongo.errors import PyMongoError
from app.core.config import settings

client = MongoClient(settings.MONGODB_URL, serverSelectionTimeoutMS=5000)

db = client[settings.DATABASE_NAME]

# Collections
users = db["users"]

def check_database_connection():
    """Check whether MongoDB is reachable."""
    try:
        client.admin.command('ping')
        return True
    except PyMongoError:
        return False