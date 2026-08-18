from pymongo import ASCENDING, DESCENDING
from pymongo.errors import PyMongoError
from app.db.mongodb import db, users, workspaces, documents, document_chunks


def create_indexes():
    """Create MongoDB indexes for all collections."""
    try:
        # Users
        users.create_index([("email", ASCENDING)], unique=True, name="email_unique")
        users.create_index([("name", ASCENDING)], name="name_index")

        # Workspaces
        workspaces.create_index(
            [("owner_id", ASCENDING), ("created_at", DESCENDING)],
            name="workspace_owner_created",
        )

        # Documents
        documents.create_index(
            [("workspace_id", ASCENDING), ("created_at", DESCENDING)],
            name="document_workspace_created",
        )
        documents.create_index(
            [("owner_id", ASCENDING), ("status", ASCENDING)],
            name="document_owner_status",
        )

        # Chunks
        document_chunks.create_index(
            [("document_id", ASCENDING), ("chunk_index", ASCENDING)],
            unique=True,
            name="unique_document_chunk",
        )
        document_chunks.create_index(
            [("workspace_id", ASCENDING)],
            name="chunk_workspace",
        )

        print("All indexes created successfully")
        return True
    except PyMongoError as e:
        print(f"Error creating indexes: {e}")
        return False


def drop_indexes():
    """Drop all custom indexes (keeps default _id index)."""
    try:
        users.drop_indexes()
        workspaces.drop_indexes()
        documents.drop_indexes()
        document_chunks.drop_indexes()
        print("All custom indexes dropped successfully")
        return True
    except PyMongoError as e:
        print(f"Error dropping indexes: {e}")
        return False


def get_index_info():
    """Get information about existing indexes across collections."""
    try:
        info = {}
        for name, collection in (
            ("users", users),
            ("workspaces", workspaces),
            ("documents", documents),
            ("document_chunks", document_chunks),
        ):
            info[name] = collection.index_information()
            print(f"Indexes on {name}:")
            for index_name, index_details in info[name].items():
                print(f"  - {index_name}: {index_details}")
        return info
    except PyMongoError as e:
        print(f"Error getting index info: {e}")
        return None


if __name__ == "__main__":
    # For testing purposes
    print("Creating MongoDB indexes...")
    create_indexes()
    get_index_info()
