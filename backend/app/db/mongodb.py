from pymongo import MongoClient
from pymongo.errors import PyMongoError
from app.core.config import settings

client = MongoClient(settings.MONGODB_URL, serverSelectionTimeoutMS=5000)

db = client[settings.DATABASE_NAME]

# Collections
users = db["users"]
workspaces = db["workspaces"]
documents = db["documents"]
document_chunks = db["document_chunks"]


def get_database():
    """Return the active MongoDB database instance."""
    return db


def check_database_connection():
    """Check whether MongoDB is reachable."""
    try:
        client.admin.command('ping')
        return True
    except PyMongoError:
        return False