from datetime import datetime, timezone

from bson import ObjectId

from app.db.mongodb import get_database
from app.modules.document_processing.extractor import (
    extract_text,
    TextExtractionError,
)
from app.modules.document_processing.chunker import (
    chunk_text,
)


CHUNK_SIZE = 800
CHUNK_OVERLAP = 120


def process_document(document_id: str):
    """Extract text from a document, chunk it, and store the chunks.

    Runs as a background task after upload, so failures are recorded on the
    document itself (status="failed", error=<message>) rather than raised.
    """
    db = get_database()

    documents = db.documents
    chunks_collection = db.document_chunks

    if not ObjectId.is_valid(document_id):
        return

    object_id = ObjectId(document_id)

    document = documents.find_one({"_id": object_id})

    if not document:
        return

    try:
        text = extract_text(
            document["file_path"],
            document["filename"],
        )

        chunks = chunk_text(
            text,
            chunk_size=CHUNK_SIZE,
            chunk_overlap=CHUNK_OVERLAP,
        )

        chunk_documents = []

        now = datetime.now(timezone.utc)

        for chunk in chunks:
            chunk_documents.append({
                "document_id": object_id,
                "workspace_id": document["workspace_id"],
                "owner_id": document["owner_id"],

                "chunk_index": chunk.chunk_index,

                "text": chunk.text,

                "start_word": chunk.start_word,
                "end_word": chunk.end_word,

                "created_at": now,
            })

        # Delete old chunks if document is reprocessed.
        chunks_collection.delete_many({"document_id": object_id})

        if chunk_documents:
            chunks_collection.insert_many(chunk_documents)

        documents.update_one(
            {"_id": object_id},
            {
                "$set": {
                    "status": "ready",
                    "text_length": len(text),
                    "chunk_count": len(chunks),
                    "error": None,
                    "updated_at": datetime.now(timezone.utc),
                }
            },
        )

    except TextExtractionError as exc:
        documents.update_one(
            {"_id": object_id},
            {
                "$set": {
                    "status": "failed",
                    "error": str(exc),
                    "updated_at": datetime.now(timezone.utc),
                }
            },
        )

    except Exception as exc:
        documents.update_one(
            {"_id": object_id},
            {
                "$set": {
                    "status": "failed",
                    "error": f"Unexpected error: {exc}",
                    "updated_at": datetime.now(timezone.utc),
                }
            },
        )
