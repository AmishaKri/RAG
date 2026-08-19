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
# Phase 4 Vector Service Import
from app.modules.vector.service import vector_service

CHUNK_SIZE = 800
CHUNK_OVERLAP = 120


def process_document(document_id: str):
    """
    Extracts text from document, creates chunks, stores them in MongoDB,
    generates embeddings, and indexes them into Qdrant for Hybrid Search.
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
        # 1. Update status to processing
        documents.update_one(
            {"_id": object_id},
            {
                "$set": {
                    "status": "processing",
                    "updated_at": datetime.now(timezone.utc),
                }
            },
        )

        # 2. Phase 3: Text Extraction
        text = extract_text(
            document["file_path"],
            document["filename"],
        )

        # 3. Phase 3: Text Chunking
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

        # 4. Cleanup old data if re-processing document
        chunks_collection.delete_many({"document_id": object_id})
        vector_service.delete_document_vectors(str(object_id))

        # 5. Save to MongoDB and Index into Qdrant (Phase 4 Linking)
        if chunk_documents:
            # Insert into MongoDB to get MongoDB _ids
            inserted = chunks_collection.insert_many(chunk_documents)

            # Attach inserted _id to each dictionary for Qdrant payload mapping
            for idx, chunk_doc in enumerate(chunk_documents):
                chunk_doc["_id"] = inserted.inserted_ids[idx]

            # Index Dense + Sparse vectors directly into Qdrant
            vector_service.index_chunks(chunk_documents)

        # 6. Mark Document status as ready
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