from fastapi import APIRouter, Depends, status
from app.schemas.vector import SearchQuery, SearchResult
from app.modules.vector.service import vector_service
from app.core.security import get_current_user

router = APIRouter(prefix="/search", tags=["Vector Search"])

@router.post("/hybrid", response_model=list[SearchResult], status_code=status.HTTP_200_OK)
def search_hybrid(
    search_data: SearchQuery,
    current_user: dict = Depends(get_current_user),
):
    results = vector_service.hybrid_search(
        query=search_data.query,
        workspace_id=search_data.workspace_id,
        top_k=search_data.top_k,
    )
    return results