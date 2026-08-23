# created by Copilot CLI runtime in VS Code - placeholder
from datetime import datetime, timezone
from bson import ObjectId
from fastapi import HTTPException, status
from app.db.mongodb import get_database


class ChatService:
    @property
    def conversations(self):
        return get_database().conversations

    @property
    def messages(self):
        return get_database().messages

    # --- Conversations ---
    def create_conversation(self, user_id: str, workspace_id: str, title: str = "New Conversation") -> dict:
        now = datetime.now(timezone.utc)
        conv_doc = {
            "user_id": ObjectId(user_id),
            "workspace_id": ObjectId(workspace_id),
            "title": title,
            "created_at": now,
            "updated_at": now,
        }
        res = self.conversations.insert_one(conv_doc)
        conv_doc["id"] = str(res.inserted_id)
        conv_doc["user_id"] = str(conv_doc["user_id"])
        conv_doc["workspace_id"] = str(conv_doc["workspace_id"])
        return conv_doc

    def get_user_conversations(self, user_id: str, workspace_id: str) -> list[dict]:
        cursor = self.conversations.find({
            "user_id": ObjectId(user_id),
            "workspace_id": ObjectId(workspace_id)
        }).sort("updated_at", -1)

        result = []
        for doc in cursor:
            doc["id"] = str(doc["_id"])
            doc["user_id"] = str(doc["user_id"])
            doc["workspace_id"] = str(doc["workspace_id"])
            result.append(doc)
        return result

    def rename_conversation(self, conversation_id: str, user_id: str, title: str) -> dict:
        if not ObjectId.is_valid(conversation_id):
            raise HTTPException(status_code=400, detail="Invalid conversation ID")

        now = datetime.now(timezone.utc)
        doc = self.conversations.find_one_and_update(
            {"_id": ObjectId(conversation_id), "user_id": ObjectId(user_id)},
            {"$set": {"title": title, "updated_at": now}},
            return_document=True,
        )
        if not doc:
            raise HTTPException(status_code=404, detail="Conversation not found")

        doc["id"] = str(doc["_id"])
        doc["user_id"] = str(doc["user_id"])
        doc["workspace_id"] = str(doc["workspace_id"])
        return doc

    def delete_conversation(self, conversation_id: str, user_id: str):
        if not ObjectId.is_valid(conversation_id):
            raise HTTPException(status_code=400, detail="Invalid conversation ID")

        res = self.conversations.delete_one({
            "_id": ObjectId(conversation_id),
            "user_id": ObjectId(user_id)
        })
        if res.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Conversation not found")

        # Delete all attached messages
        self.messages.delete_many({"conversation_id": ObjectId(conversation_id)})

    # --- Messages ---
    def add_message(
        self,
        conversation_id: str,
        role: str,
        content: str,
        citations: list = None
    ) -> dict:
        if not ObjectId.is_valid(conversation_id):
            raise HTTPException(status_code=400, detail="Invalid conversation ID")

        now = datetime.now(timezone.utc)
        msg_doc = {
            "conversation_id": ObjectId(conversation_id),
            "role": role,
            "content": content,
            "citations": citations or [],
            "feedback": None,
            "created_at": now,
        }
        res = self.messages.insert_one(msg_doc)

        # Touch conversation updated_at
        self.conversations.update_one(
            {"_id": ObjectId(conversation_id)},
            {"$set": {"updated_at": now}}
        )

        msg_doc["id"] = str(res.inserted_id)
        msg_doc["conversation_id"] = str(msg_doc["conversation_id"])
        return msg_doc

    def get_messages(self, conversation_id: str, limit: int = 50) -> list[dict]:
        if not ObjectId.is_valid(conversation_id):
            raise HTTPException(status_code=400, detail="Invalid conversation ID")

        cursor = self.messages.find({
            "conversation_id": ObjectId(conversation_id)
        }).sort("created_at", 1).limit(limit)

        result = []
        for doc in cursor:
            doc["id"] = str(doc["_id"])
            doc["conversation_id"] = str(doc["conversation_id"])
            result.append(doc)
        return result

    # --- Feedback ---
    def record_feedback(self, message_id: str, feedback_data: dict) -> dict:
        if not ObjectId.is_valid(message_id):
            raise HTTPException(status_code=400, detail="Invalid message ID")

        now = datetime.now(timezone.utc)
        feedback_record = {
            "rating": feedback_data["rating"],
            "comment": feedback_data.get("comment"),
            "category": feedback_data.get("category"),
            "updated_at": now,
        }

        res = self.messages.update_one(
            {"_id": ObjectId(message_id)},
            {"$set": {"feedback": feedback_record}}
        )
        if res.matched_count == 0:
            raise HTTPException(status_code=404, detail="Message not found")

        feedback_record["message_id"] = message_id
        return feedback_record

    # --- RAG Evaluation ---
    def evaluate_response(self, query: str, context: list[str], answer: str) -> dict:
        """
        Lightweight automated groundedness and relevance heuristic/LLM eval.
        """
        if not context or not answer:
            return {
                "faithfulness_score": 0.0,
                "relevance_score": 0.0,
                "reasoning": "Missing context or generated answer."
            }

        # Context overlap check
        joined_context = " ".join(context).lower()
        answer_words = set(answer.lower().split())
        matched_words = [w for w in answer_words if w in joined_context and len(w) > 3]

        overlap_ratio = min(1.0, len(matched_words) / max(1, len(answer_words)))
        faithfulness = round(max(0.3, overlap_ratio), 2)
        relevance = 0.95 if len(answer) > 20 else 0.4

        return {
            "faithfulness_score": faithfulness,
            "relevance_score": relevance,
            "reasoning": "Heuristic match based on token coverage and answer completeness."
        }


chat_service = ChatService()