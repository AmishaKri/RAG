from bson import ObjectId

from app.db.mongodb import get_database
from app.models.document import document_record


class DocumentService:

    def __init__(self):
        self.db = get_database()
        self.collection = self.db.documents
        self.chunks_collection = self.db.document_chunks

    def create(
        self,
        *,
        workspace_id: str,
        owner_id: str,
        filename: str,
        content_type: str | None,
        file_size: int,
        file_path: str,
    ):

        document = document_record(
            workspace_id=workspace_id,
            owner_id=owner_id,
            filename=filename,
            content_type=content_type,
            file_size=file_size,
            file_path=file_path,
        )

        result = self.collection.insert_one(document)

        document["_id"] = result.inserted_id

        return document

    def list_for_workspace(
        self,
        workspace_id: str,
        owner_id: str,
    ):

        return list(
            self.collection.find({
                "workspace_id": workspace_id,
                "owner_id": owner_id,
            }).sort(
                "created_at",
                -1,
            )
        )

    def get(
        self,
        document_id: str,
        workspace_id: str,
        owner_id: str,
    ):

        if not ObjectId.is_valid(document_id):
            return None

        return self.collection.find_one({
            "_id": ObjectId(document_id),
            "workspace_id": workspace_id,
            "owner_id": owner_id,
        })

    def delete(
        self,
        document_id: str,
        workspace_id: str,
        owner_id: str,
    ):

        if not ObjectId.is_valid(document_id):
            return None

        document = self.collection.find_one_and_delete({
            "_id": ObjectId(document_id),
            "workspace_id": workspace_id,
            "owner_id": owner_id,
        })

        if document:
            self.chunks_collection.delete_many({
                "document_id": ObjectId(document_id),
            })

        return document
