import json
from datetime import datetime
from typing import Any, List, Optional, Union
from pydantic import BaseModel, ConfigDict, Field, field_validator
from app.schemas.user import UserResponse


class DocumentCreate(BaseModel):
    title: Optional[str] = Field(default=None, description="Document title")
    content: Optional[Any] = Field(
        default_factory=lambda: {"type": "doc", "content": []},
        description="Rich-text content (Tiptap JSON or string)",
    )

    @field_validator("title")
    @classmethod
    def set_default_title(cls, v: Optional[str]) -> str:
        if v is None or not v.strip():
            return "Untitled Document"
        return v.strip()


class DocumentUpdate(BaseModel):
    title: Optional[str] = Field(default=None, description="Updated document title")
    content: Optional[Any] = Field(default=None, description="Updated rich-text content")

    @field_validator("title")
    @classmethod
    def clean_title(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            stripped = v.strip()
            return stripped if stripped else "Untitled Document"
        return v


class DocumentResponse(BaseModel):
    id: int
    title: str
    content: Any
    owner_id: int
    owner: Optional[UserResponse] = None
    user_permission: Optional[str] = Field(
        default=None,
        description="Current authenticated user's permission (e.g. 'owner', 'editor', 'viewer')",
    )
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

    @field_validator("content", mode="before")
    @classmethod
    def parse_json_content(cls, v: Any) -> Any:
        if isinstance(v, str):
            try:
                return json.loads(v)
            except Exception:
                return v
        return v


class SharedDocumentItem(BaseModel):
    id: int
    title: str
    content: Any
    owner_id: int
    owner: Optional[UserResponse] = None
    permission: str
    created_at: datetime
    updated_at: datetime
    shared_at: datetime

    model_config = ConfigDict(from_attributes=True)

    @field_validator("content", mode="before")
    @classmethod
    def parse_json_content(cls, v: Any) -> Any:
        if isinstance(v, str):
            try:
                return json.loads(v)
            except Exception:
                return v
        return v


class DocumentListResponse(BaseModel):
    my_documents: List[DocumentResponse]
    shared_with_me: List[SharedDocumentItem]
