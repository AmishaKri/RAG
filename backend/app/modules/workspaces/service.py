from datetime import datetime, timezone

from bson import ObjectId

from app.db.mongodb import get_database
from app.models.workspace import workspace_document


class WorkspaceService:

    def __init__(self):
        self.db = get_database()
        self.collection = self.db.workspaces

    def create(
        self,
        *,
        name: str,
        description: str | None,
        owner_id: str,
    ):
        document = workspace_document(
            name=name,
            description=description,
            owner_id=owner_id,
        )

        result = self.collection.insert_one(document)

        document["_id"] = result.inserted_id

        return document

    def list_for_user(self, owner_id: str):
        return list(
            self.collection.find(
                {"owner_id": owner_id}
            ).sort("created_at", -1)
        )

    def get_for_user(
        self,
        workspace_id: str,
        owner_id: str,
    ):
        if not ObjectId.is_valid(workspace_id):
            return None

        return self.collection.find_one({
            "_id": ObjectId(workspace_id),
            "owner_id": owner_id,
        })

    def delete_for_user(
        self,
        workspace_id: str,
        owner_id: str,
    ):
        if not ObjectId.is_valid(workspace_id):
            return False

        result = self.collection.delete_one({
            "_id": ObjectId(workspace_id),
            "owner_id": owner_id,
        })

        return result.deleted_count > 0


workspace_service = WorkspaceService()
