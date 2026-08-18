from datetime import datetime, timezone
from typing import Any


def document_record(
    *,
    workspace_id: str,
    owner_id: str,
    filename: str,
    content_type: str | None,
    file_size: int,
    file_path: str,
) -> dict[str, Any]:

    now = datetime.now(timezone.utc)

    return {
        "workspace_id": workspace_id,
        "owner_id": owner_id,

        "filename": filename,
        "content_type": content_type,
        "file_size": file_size,

        "file_path": file_path,

        "status": "processing",

        "text_length": 0,
        "chunk_count": 0,

        "error": None,

        "created_at": now,
        "updated_at": now,
    }
