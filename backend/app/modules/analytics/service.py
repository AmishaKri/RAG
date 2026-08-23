from datetime import datetime, timedelta, timezone
from bson import ObjectId
from fastapi import HTTPException, status

from app.db.mongodb import get_database
from app.modules.workspaces.service import WorkspaceService


def _format_date(dt: datetime) -> str:
    return dt.strftime("%Y-%m-%d")


def _build_daily_counts(daily_counts: dict, start: datetime, days: int = 7):
    result = []
    for i in range(days):
        d = _format_date(start + timedelta(days=i))
        result.append({"date": d, "count": daily_counts.get(d, 0)})
    return result


class AnalyticsService:
    def __init__(self):
        self.db = get_database()

    def get_workspace_summary(self, workspace_id: str, owner_id: str) -> dict:
        # Verify workspace belongs to the user
        workspace_service = WorkspaceService()
        workspace = workspace_service.get_for_user(workspace_id, owner_id)

        if not workspace:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Workspace not found",
            )

        now = datetime.now(timezone.utc)
        start = now - timedelta(days=6)  # last 7 days

        # Documents
        doc_filter = {
            "workspace_id": workspace_id,
            "owner_id": owner_id,
        }
        total_documents = self.db.documents.count_documents(doc_filter)
        total_chunks = self.db.document_chunks.count_documents({
            "workspace_id": workspace_id,
            "owner_id": owner_id,
        })

        # Conversations
        conv_filter = {
            "workspace_id": ObjectId(workspace_id),
            "user_id": ObjectId(owner_id),
        }
        total_conversations = self.db.conversations.count_documents(conv_filter)

        # User questions (user-role messages in this workspace's conversations)
        conversation_ids = [
            doc["_id"]
            for doc in self.db.conversations.find(conv_filter, {"_id": 1})
        ]
        total_questions = 0
        if conversation_ids:
            total_questions = self.db.messages.count_documents({
                "conversation_id": {"$in": conversation_ids},
                "role": "user",
            })

        # Documents created over the last 7 days
        docs_pipeline = [
            {
                "$match": {
                    **doc_filter,
                    "created_at": {"$gte": start},
                }
            },
            {
                "$group": {
                    "_id": {"$dateToString": {"format": "%Y-%m-%d", "date": "$created_at"}},
                    "count": {"$sum": 1},
                }
            },
            {"$sort": {"_id": 1}},
        ]
        docs_daily = {d["_id"]: d["count"] for d in self.db.documents.aggregate(docs_pipeline)}

        # Conversations created over the last 7 days
        conv_pipeline = [
            {
                "$match": {
                    **conv_filter,
                    "created_at": {"$gte": start},
                }
            },
            {
                "$group": {
                    "_id": {"$dateToString": {"format": "%Y-%m-%d", "date": "$created_at"}},
                    "count": {"$sum": 1},
                }
            },
            {"$sort": {"_id": 1}},
        ]
        conv_daily = {d["_id"]: d["count"] for d in self.db.conversations.aggregate(conv_pipeline)}

        # Top documents by chunk count (used as a popularity proxy)
        top_docs_cursor = (
            self.db.documents
            .find(doc_filter, {"filename": 1, "chunk_count": 1})
            .sort("chunk_count", -1)
            .limit(5)
        )
        top_documents = [
            {"filename": doc["filename"], "views": doc.get("chunk_count", 0)}
            for doc in top_docs_cursor
        ]

        return {
            "documents": total_documents,
            "chunks": total_chunks,
            "searches": 0,  # not currently tracked
            "questions": total_questions,
            "conversations": total_conversations,
            "documentsOverTime": _build_daily_counts(docs_daily, start),
            "searchesOverTime": _build_daily_counts(conv_daily, start),
            "topDocuments": top_documents,
        }


analytics_service = AnalyticsService()
