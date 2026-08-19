from qdrant_client import QdrantClient
from qdrant_client.http import models
from app.core.config import settings

qdrant_client = QdrantClient(
    url=settings.QDRANT_URL,
    api_key=settings.QDRANT_API_KEY or None,
    timeout=60,
)

def init_qdrant_collection():
    collection_name = settings.QDRANT_COLLECTION_NAME
    collections = [c.name for c in qdrant_client.get_collections().collections]

    if collection_name not in collections:
        qdrant_client.create_collection(
            collection_name=collection_name,
            vectors_config={
                "dense": models.VectorParams(
                    size=settings.EMBEDDING_DIMENSION,  # 384
                    distance=models.Distance.COSINE,
                )
            },
            sparse_vectors_config={
                "sparse": models.SparseVectorParams()
            }
        )
        
        # Filtering payload indexes
        qdrant_client.create_payload_index(
            collection_name=collection_name,
            field_name="workspace_id",
            field_schema=models.PayloadSchemaType.KEYWORD,
        )
        qdrant_client.create_payload_index(
            collection_name=collection_name,
            field_name="document_id",
            field_schema=models.PayloadSchemaType.KEYWORD,
        )
        qdrant_client.create_payload_index(
            collection_name=collection_name,
            field_name="owner_id",
            field_schema=models.PayloadSchemaType.KEYWORD,
        )