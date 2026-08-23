from fastapi import APIRouter, Depends

from app.core.security import get_current_user_id
from app.modules.analytics.service import analytics_service

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/{workspace_id}")
def get_workspace_analytics(
    workspace_id: str,
    current_user_id: str = Depends(get_current_user_id),
):
    """Get aggregated workspace analytics from live database counts."""
    return analytics_service.get_workspace_summary(workspace_id, current_user_id)
