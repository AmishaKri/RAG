from datetime import datetime

from pydantic import BaseModel


class DocumentResponse(BaseModel):
    id: str
    workspace_id: str

    filename: str
    content_type: str | None
    file_size: int

    status: str

    text_length: int
    chunk_count: int

    error: str | None = None

    created_at: datetime
    updated_at: datetime


class ChunkResponse(BaseModel):
    id: str
    document_id: str
    chunk_index: int
    text: str
