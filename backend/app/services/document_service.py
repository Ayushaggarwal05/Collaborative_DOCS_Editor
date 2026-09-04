import json
from datetime import datetime, timezone
from typing import Any
from sqlalchemy.orm import Session, joinedload

from app.models.document import Document
from app.models.document_share import DocumentShare
from app.models.user import User
from app.schemas.document import (
    DocumentCreate,
    DocumentListResponse,
    DocumentResponse,
    DocumentUpdate,
    SharedDocumentItem,
)
from app.schemas.user import UserResponse
from app.services.permission_service import (
    get_user_document_permission,
    verify_document_access,
)


def _serialize_content(content: Any) -> str:
    """Convert Tiptap JSON content or string to database text format."""
    if content is None:
        return json.dumps({"type": "doc", "content": []})
    if isinstance(content, (dict, list)):
        return json.dumps(content)
    return str(content)


def create_document(db: Session, payload: DocumentCreate, user: User) -> DocumentResponse:
    """Create a new document owned by the given user."""
    serialized_content = _serialize_content(payload.content)
    doc = Document(
        title=payload.title,
        content=serialized_content,
        owner_id=user.id,
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    return DocumentResponse(
        id=doc.id,
        title=doc.title,
        content=doc.content,
        owner_id=doc.owner_id,
        owner=UserResponse.model_validate(user),
        user_permission="owner",
        created_at=doc.created_at,
        updated_at=doc.updated_at,
    )


def list_user_documents(db: Session, user: User) -> DocumentListResponse:
    """List documents owned by user and documents shared with user."""
    # 1. My Documents
    my_docs = (
        db.query(Document)
        .options(joinedload(Document.owner))
        .filter(Document.owner_id == user.id)
        .order_by(Document.updated_at.desc())
        .all()
    )

    my_documents_res = [
        DocumentResponse(
            id=d.id,
            title=d.title,
            content=d.content,
            owner_id=d.owner_id,
            owner=UserResponse.model_validate(d.owner) if d.owner else None,
            user_permission="owner",
            created_at=d.created_at,
            updated_at=d.updated_at,
        )
        for d in my_docs
    ]

    # 2. Shared with me
    shared_shares = (
        db.query(DocumentShare)
        .options(joinedload(DocumentShare.document).joinedload(Document.owner))
        .filter(DocumentShare.user_id == user.id)
        .order_by(DocumentShare.created_at.desc())
        .all()
    )

    shared_with_me_res = []
    for share in shared_shares:
        doc = share.document
        if doc:
            shared_with_me_res.append(
                SharedDocumentItem(
                    id=doc.id,
                    title=doc.title,
                    content=doc.content,
                    owner_id=doc.owner_id,
                    owner=UserResponse.model_validate(doc.owner) if doc.owner else None,
                    permission=share.permission,
                    created_at=doc.created_at,
                    updated_at=doc.updated_at,
                    shared_at=share.created_at,
                )
            )

    return DocumentListResponse(
        my_documents=my_documents_res,
        shared_with_me=shared_with_me_res,
    )


def get_document_details(db: Session, document_id: int, user: User) -> DocumentResponse:
    """Retrieve document details if user has permission to view."""
    doc, permission = verify_document_access(
        db=db,
        document_id=document_id,
        user=user,
        required_action="view",
    )

    return DocumentResponse(
        id=doc.id,
        title=doc.title,
        content=doc.content,
        owner_id=doc.owner_id,
        owner=UserResponse.model_validate(doc.owner) if doc.owner else None,
        user_permission=permission,
        created_at=doc.created_at,
        updated_at=doc.updated_at,
    )


def update_document(
    db: Session,
    document_id: int,
    payload: DocumentUpdate,
    user: User,
) -> DocumentResponse:
    """Update title and/or content if user has edit permission."""
    doc, permission = verify_document_access(
        db=db,
        document_id=document_id,
        user=user,
        required_action="edit",
    )

    if payload.title is not None:
        doc.title = payload.title
    if payload.content is not None:
        doc.content = _serialize_content(payload.content)

    doc.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(doc)

    return DocumentResponse(
        id=doc.id,
        title=doc.title,
        content=doc.content,
        owner_id=doc.owner_id,
        owner=UserResponse.model_validate(doc.owner) if doc.owner else None,
        user_permission=permission,
        created_at=doc.created_at,
        updated_at=doc.updated_at,
    )


def delete_document(db: Session, document_id: int, user: User) -> None:
    """Delete document if user is the owner."""
    doc, _ = verify_document_access(
        db=db,
        document_id=document_id,
        user=user,
        required_action="delete",
    )

    db.delete(doc)
    db.commit()
