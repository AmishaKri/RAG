from pathlib import Path

from fastapi import (
    APIRouter,
    BackgroundTasks,
    Depends,
    File,
    HTTPException,
    UploadFile,
    status,
)

from app.core.security import get_current_user_id
from app.schemas.document import DocumentResponse
from app.modules.documents.service import DocumentService
from app.modules.workspaces.service import WorkspaceService
from app.utils.file_utils import save_upload_file, delete_file
from app.modules.document_processing.processor import process_document


router = APIRouter(
    prefix="/workspaces/{workspace_id}/documents",
    tags=["Documents"],
)


ALLOWED_EXTENSIONS = {
    ".pdf",
    ".docx",
    ".txt",
    ".csv",
}

MAX_FILE_SIZE = 20 * 1024 * 1024  # 20 MB


def serialize_document(document: dict) -> dict:
    return {
        "id": str(document["_id"]),
        "workspace_id": document["workspace_id"],
        "filename": document["filename"],
        "content_type": document.get("content_type"),
        "file_size": document["file_size"],
        "status": document["status"],
        "text_length": document.get("text_length", 0),
        "chunk_count": document.get("chunk_count", 0),
        "error": document.get("error"),
        "created_at": document["created_at"],
        "updated_at": document["updated_at"],
    }


def _get_owned_workspace(workspace_id: str, owner_id: str):
    workspace_service = WorkspaceService()
    workspace = workspace_service.get_for_user(workspace_id, owner_id)

    if not workspace:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workspace not found",
        )

    return workspace


@router.post(
    "",
    response_model=DocumentResponse,
    status_code=status.HTTP_201_CREATED,
)
async def upload_document(
    workspace_id: str,
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    current_user_id: str = Depends(get_current_user_id),
):
    # 1. Verify workspace ownership
    _get_owned_workspace(workspace_id, current_user_id)

    # 2. Validate file extension
    extension = Path(file.filename).suffix.lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type '{extension}'. Allowed types: {', '.join(sorted(ALLOWED_EXTENSIONS))}",
        )

    # 3. Save file to disk (UUID filename to avoid collisions)
    file_path, _stored_filename = await save_upload_file(file, workspace_id)

    file_size = Path(file_path).stat().st_size

    # 4. Enforce max file size (after save, remove if too large)
    if file_size > MAX_FILE_SIZE:
        await delete_file(file_path)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File too large. Maximum allowed size is {MAX_FILE_SIZE // (1024 * 1024)} MB",
        )

    # 5. Create document metadata record
    document_service = DocumentService()

    document = document_service.create(
        workspace_id=workspace_id,
        owner_id=current_user_id,
        filename=file.filename,
        content_type=file.content_type,
        file_size=file_size,
        file_path=file_path,
    )

    # 6. Schedule background text extraction + chunking
    background_tasks.add_task(process_document, str(document["_id"]))

    return serialize_document(document)


@router.get(
    "",
    response_model=list[DocumentResponse],
)
def list_documents(
    workspace_id: str,
    current_user_id: str = Depends(get_current_user_id),
):
    _get_owned_workspace(workspace_id, current_user_id)

    document_service = DocumentService()

    documents = document_service.list_for_workspace(workspace_id, current_user_id)

    return [serialize_document(document) for document in documents]


@router.get(
    "/{document_id}",
    response_model=DocumentResponse,
)
def get_document(
    workspace_id: str,
    document_id: str,
    current_user_id: str = Depends(get_current_user_id),
):
    _get_owned_workspace(workspace_id, current_user_id)

    document_service = DocumentService()

    document = document_service.get(document_id, workspace_id, current_user_id)

    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found",
        )

    return serialize_document(document)


@router.delete(
    "/{document_id}",
    status_code=status.HTTP_200_OK,
)
async def delete_document(
    workspace_id: str,
    document_id: str,
    current_user_id: str = Depends(get_current_user_id),
):
    _get_owned_workspace(workspace_id, current_user_id)

    document_service = DocumentService()

    document = document_service.delete(document_id, workspace_id, current_user_id)

    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found",
        )

    await delete_file(document["file_path"])

    return {"message": "Document deleted successfully"}
