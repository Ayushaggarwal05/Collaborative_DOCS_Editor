from typing import List
from fastapi import APIRouter, Depends, File, UploadFile, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.document import (
    DocumentCreate,
    DocumentListResponse,
    DocumentResponse,
    DocumentUpdate,
)
from app.schemas.share import ShareCreateRequest, ShareResponse
from app.services import document_service, import_service, share_service

router = APIRouter(prefix="/documents", tags=["Documents"])


@router.post(
    "",
    response_model=DocumentResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create document",
)
def create_document(
    payload: DocumentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a new document for the authenticated user."""
    return document_service.create_document(
        db=db,
        payload=payload,
        user=current_user,
    )


@router.post(
    "/import",
    response_model=DocumentResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Import .txt or .md file as document",
)
async def import_document(
    file: UploadFile = File(..., description="Uploaded .txt or .md file"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Import a .txt or .md file and create a new editable document."""
    return await import_service.import_document_file(
        db=db,
        file=file,
        current_user=current_user,
    )


@router.get(
    "",
    response_model=DocumentListResponse,
    summary="List my documents and shared documents",
)
def list_documents(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieve documents owned by current user and documents shared with current user."""
    return document_service.list_user_documents(
        db=db,
        user=current_user,
    )


@router.get(
    "/{document_id}",
    response_model=DocumentResponse,
    summary="Get document by ID",
)
def get_document(
    document_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieve document details if user is the owner or has view/edit share access."""
    return document_service.get_document_details(
        db=db,
        document_id=document_id,
        user=current_user,
    )


@router.put(
    "/{document_id}",
    response_model=DocumentResponse,
    summary="Update document",
)
def update_document(
    document_id: int,
    payload: DocumentUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update title and/or content if user is owner or has editor permission."""
    return document_service.update_document(
        db=db,
        document_id=document_id,
        payload=payload,
        user=current_user,
    )


@router.delete(
    "/{document_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete document",
)
def delete_document(
    document_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete document (owner only). Shared users receive 403 Forbidden."""
    document_service.delete_document(
        db=db,
        document_id=document_id,
        user=current_user,
    )
    return None


@router.post(
    "/{document_id}/share",
    response_model=ShareResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Share document with user",
)
def share_document(
    document_id: int,
    payload: ShareCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Share a document with another user (owner only)."""
    return share_service.share_document(
        db=db,
        document_id=document_id,
        current_user=current_user,
        payload=payload,
    )


@router.get(
    "/{document_id}/shares",
    response_model=List[ShareResponse],
    summary="List shares for document",
)
def list_shares(
    document_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List all users with whom this document is shared."""
    return share_service.list_document_shares(
        db=db,
        document_id=document_id,
        current_user=current_user,
    )


@router.delete(
    "/{document_id}/share/{user_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Revoke document share for a user",
)
@router.delete(
    "/{document_id}/shares/{user_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Revoke document share for a user (alias)",
)
def revoke_share(
    document_id: int,
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Revoke sharing access for a user (owner only)."""
    share_service.revoke_document_share(
        db=db,
        document_id=document_id,
        target_user_id=user_id,
        current_user=current_user,
    )
    return None

