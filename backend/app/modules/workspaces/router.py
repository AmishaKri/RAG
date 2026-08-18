from fastapi import APIRouter, Depends, HTTPException, status

from app.schemas.workspace import (
    WorkspaceCreate,
    WorkspaceResponse,
)
from app.modules.workspaces.service import WorkspaceService
from app.core.security import get_current_user_id


router = APIRouter(
    prefix="/workspaces",
    tags=["Workspaces"],
)


def serialize_workspace(workspace: dict) -> dict:
    return {
        "id": str(workspace["_id"]),
        "name": workspace["name"],
        "description": workspace.get("description"),
        "owner_id": workspace["owner_id"],
        "created_at": workspace["created_at"],
        "updated_at": workspace["updated_at"],
    }


@router.post(
    "",
    response_model=WorkspaceResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_workspace(
    payload: WorkspaceCreate,
    current_user_id: str = Depends(get_current_user_id),
):
    service = WorkspaceService()

    workspace = service.create(
        name=payload.name,
        description=payload.description,
        owner_id=current_user_id,
    )

    return serialize_workspace(workspace)


@router.get(
    "",
    response_model=list[WorkspaceResponse],
)
def list_workspaces(
    current_user_id: str = Depends(get_current_user_id),
):
    service = WorkspaceService()

    workspaces = service.list_for_user(current_user_id)

    return [
        serialize_workspace(workspace)
        for workspace in workspaces
    ]


@router.get(
    "/{workspace_id}",
    response_model=WorkspaceResponse,
)
def get_workspace(
    workspace_id: str,
    current_user_id: str = Depends(get_current_user_id),
):
    service = WorkspaceService()

    workspace = service.get_for_user(
        workspace_id,
        current_user_id,
    )

    if not workspace:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workspace not found",
        )

    return serialize_workspace(workspace)


@router.delete(
    "/{workspace_id}",
    status_code=status.HTTP_200_OK,
)
def delete_workspace(
    workspace_id: str,
    current_user_id: str = Depends(get_current_user_id),
):
    service = WorkspaceService()

    deleted = service.delete_for_user(
        workspace_id,
        current_user_id,
    )

    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workspace not found",
        )

    return {"message": "Workspace deleted successfully"}
