from typing import Optional, Tuple
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.document import Document
from app.models.document_share import DocumentShare
from app.models.user import User

EDIT_PERMISSIONS = {"edit", "editor", "owner", "admin"}
VIEW_PERMISSIONS = {"view", "viewer", "edit", "editor", "owner", "admin"}


def get_user_document_permission(
    db: Session, document: Document, user_id: int
) -> Optional[str]:
    """Determine the exact permission string a user has on a document."""
    if document.owner_id == user_id:
        return "owner"

    share = (
        db.query(DocumentShare)
        .filter(
            DocumentShare.document_id == document.id,
            DocumentShare.user_id == user_id,
        )
        .first()
    )
    if share:
        return share.permission.lower()

    return None


def verify_document_access(
    db: Session,
    document_id: int,
    user: User,
    required_action: str = "view",
) -> Tuple[Document, str]:
    """
    Verify if a document exists and if the user has permission to perform the requested action.
    required_action can be: 'view', 'edit', 'delete'.
    Raises 404 if document doesn't exist.
    Raises 403 if user lacks required permission.
    Returns (document, user_permission).
    """
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document with ID {document_id} not found.",
        )

    user_permission = get_user_document_permission(db, document, user.id)

    if required_action == "view":
        if not user_permission or user_permission not in VIEW_PERMISSIONS:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to view this document.",
            )
    elif required_action == "edit":
        if not user_permission or user_permission not in EDIT_PERMISSIONS:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have edit permission for this document.",
            )
    elif required_action == "delete":
        if user_permission != "owner":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only the document owner can delete this document.",
            )
    else:
        raise ValueError(f"Unknown action: {required_action}")

    return document, user_permission
