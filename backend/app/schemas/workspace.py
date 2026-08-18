from datetime import datetime

from pydantic import BaseModel, Field


class WorkspaceCreate(BaseModel):
    name: str = Field(
        ...,
        min_length=2,
        max_length=100,
    )

    description: str | None = Field(
        default=None,
        max_length=500,
    )


class WorkspaceResponse(BaseModel):
    id: str
    name: str
    description: str | None = None
    owner_id: str
    created_at: datetime
    updated_at: datetime
