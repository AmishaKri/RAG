from typing import Any
import hashlib
from fastapi import APIRouter, Depends, status
from app.schemas.vector import SearchQuery, SearchResult
from app.modules.vector.service import vector_service
from app.core.security import get_current_user
from app.core.redis import get_cache, set_cache

router = APIRouter(prefix="/search", tags=["Vector Search"])


def extract_user_id(user: Any) -> str:
    """Safely extracts user ID from dict or Pydantic model."""
    if isinstance(user, dict):
        return str(user.get("id") or user.get("_id") or user.get("user_id"))
    return str(getattr(user, "id", getattr(user, "_id", getattr(user, "user_id", ""))))


def generate_search_cache_key(workspace_id: str, query: str, top_k: int) -> str:
    """Generates a deterministic Redis cache key based on query hash."""
    query_hash = hashlib.sha256(query.strip().lower().encode("utf-8")).hexdigest()[:16]
    return f"search:{workspace_id}:{query_hash}:{top_k}"


@router.post("/hybrid", response_model=list[SearchResult], status_code=status.HTTP_200_OK)
async def search_hybrid(
    search_data: SearchQuery,
    current_user: Any = Depends(get_current_user),
):
    user_id = extract_user_id(current_user)
    
    # 1. Deterministic Cache Key Generate 
    cache_key = generate_search_cache_key(
        workspace_id=search_data.workspace_id,
        query=search_data.query,
        top_k=search_data.top_k or 5
    )

    # 2. Redis Cache n
    cached_results = await get_cache(cache_key)
    if cached_results is not None:
        return cached_results

    # 3. Cache Miss: Qdrant Hybrid Search Execute 
    results = vector_service.hybrid_search(
        query=search_data.query,
        workspace_id=search_data.workspace_id,
        owner_id=user_id,
        top_k=search_data.top_k or 5,
    )

    # 4. Result Serialized Dict/List 
    serialized_results = [
        item.model_dump() if hasattr(item, "model_dump") else item 
        for item in results
    ]
    await set_cache(cache_key, serialized_results, ttl=300)

    return results