from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field, field_validator
from app.schemas.user import UserResponse

VALID_PERMISSIONS = {"editor", "edit", "viewer", "view"}


class ShareCreateRequest(BaseModel):
    target_user_id: int = Field(..., description="ID of the user to share the document with")
    permission: str = Field(
        default="editor",
        description="Permission level: 'editor' or 'viewer'",
    )

    @field_validator("permission")
    @classmethod
    def validate_permission(cls, v: str) -> str:
        lowered = v.strip().lower()
        if lowered not in VALID_PERMISSIONS:
            raise ValueError(f"Invalid permission '{v}'. Must be 'editor' or 'viewer'.")
        # Normalize
        if lowered in {"edit", "editor"}:
            return "editor"
        return "viewer"


class ShareResponse(BaseModel):
    id: int
    document_id: int
    user_id: int
    user: Optional[UserResponse] = None
    permission: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
