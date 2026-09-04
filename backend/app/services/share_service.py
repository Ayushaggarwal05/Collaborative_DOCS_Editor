from typing import List
from fastapi import HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.models.document import Document
from app.models.document_share import DocumentShare
from app.models.user import User
from app.schemas.share import ShareCreateRequest, ShareResponse
from app.schemas.user import UserResponse
from app.services.permission_service import verify_document_access


def share_document(
    db: Session,
    document_id: int,
    current_user: User,
    payload: ShareCreateRequest,
) -> ShareResponse:
    """Share a document with another user. Only the owner can share."""
    # 1. Verify document exists and current_user is the owner
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document with ID {document_id} not found.",
        )

    if document.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the document owner can share this document.",
        )

    # 2. Check if user is attempting to share with themselves
    if payload.target_user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot share a document with yourself.",
        )

    # 3. Check target user exists
    target_user = db.query(User).filter(User.id == payload.target_user_id).first()
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Target user with ID {payload.target_user_id} does not exist.",
        )

    # 4. Check for existing duplicate share
    existing_share = (
        db.query(DocumentShare)
        .filter(
            DocumentShare.document_id == document_id,
            DocumentShare.user_id == payload.target_user_id,
        )
        .first()
    )
    if existing_share:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Document is already shared with user '{target_user.name}'.",
        )

    # 5. Create new share
    new_share = DocumentShare(
        document_id=document.id,
        user_id=target_user.id,
        permission=payload.permission,
    )
    db.add(new_share)
    db.commit()
    db.refresh(new_share)

    return ShareResponse(
        id=new_share.id,
        document_id=new_share.document_id,
        user_id=new_share.user_id,
        user=UserResponse.model_validate(target_user),
        permission=new_share.permission,
        created_at=new_share.created_at,
    )


def list_document_shares(
    db: Session,
    document_id: int,
    current_user: User,
) -> List[ShareResponse]:
    """List all users with whom this document is shared (owner or shared users)."""
    # Verify access first (view permission is sufficient to view shares list)
    document, _ = verify_document_access(
        db=db,
        document_id=document_id,
        user=current_user,
        required_action="view",
    )

    shares = (
        db.query(DocumentShare)
        .options(joinedload(DocumentShare.user))
        .filter(DocumentShare.document_id == document.id)
        .order_by(DocumentShare.created_at.asc())
        .all()
    )

    return [
        ShareResponse(
            id=s.id,
            document_id=s.document_id,
            user_id=s.user_id,
            user=UserResponse.model_validate(s.user) if s.user else None,
            permission=s.permission,
            created_at=s.created_at,
        )
        for s in shares
    ]


def revoke_document_share(
    db: Session,
    document_id: int,
    target_user_id: int,
    current_user: User,
) -> None:
    """Revoke sharing access for a target user. Only the owner can revoke shares."""
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document with ID {document_id} not found.",
        )

    if document.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the document owner can revoke access.",
        )

    share = (
        db.query(DocumentShare)
        .filter(
            DocumentShare.document_id == document_id,
            DocumentShare.user_id == target_user_id,
        )
        .first()
    )
    if not share:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Share record for user {target_user_id} not found on this document.",
        )

    db.delete(share)
    db.commit()

