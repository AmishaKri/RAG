from pathlib import Path
from uuid import uuid4

import aiofiles


BASE_STORAGE_DIR = Path("storage/documents")

BASE_STORAGE_DIR.mkdir(
    parents=True,
    exist_ok=True,
)


async def save_upload_file(
    upload_file,
    workspace_id: str,
) -> tuple[str, str]:
    """Save an uploaded file to disk under a UUID name and return (file_path, stored_filename)."""
    workspace_dir = BASE_STORAGE_DIR / workspace_id

    workspace_dir.mkdir(
        parents=True,
        exist_ok=True,
    )

    extension = Path(upload_file.filename).suffix.lower()

    stored_filename = f"{uuid4().hex}{extension}"

    file_path = workspace_dir / stored_filename

    async with aiofiles.open(file_path, "wb") as output_file:
        while chunk := await upload_file.read(1024 * 1024):
            await output_file.write(chunk)

    return (str(file_path), stored_filename)


async def delete_file(file_path: str):
    """Delete a file from disk if it exists."""
    path = Path(file_path)

    if path.exists():
        path.unlink()
