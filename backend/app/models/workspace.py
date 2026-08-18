from datetime import datetime, timezone
from typing import Any


def workspace_document(
    *,
    name: str,
    description: str | None,
    owner_id: str,
) -> dict[str, Any]:
    now = datetime.now(timezone.utc)

    return {
        "name": name.strip(),
        "description": description.strip() if description else None,
        "owner_id": owner_id,
        "created_at": now,
        "updated_at": now,
    }
