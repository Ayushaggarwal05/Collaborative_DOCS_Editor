from typing import Optional
from fastapi import Depends, Header, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User


def get_current_user(
    x_user_id: Optional[str] = Header(None, alias="X-User-Id", description="User ID or Email header"),
    authorization: Optional[str] = Header(None, description="Bearer <user_id_or_email>"),
    auth_user_id: Optional[str] = Query(None, alias="user_id", description="User ID or Email query parameter"),
    db: Session = Depends(get_db),
) -> User:
    """Resolve and authenticate the current user from headers or query parameters."""
    identifier: Optional[str] = None

    if x_user_id:
        identifier = str(x_user_id).strip()
    elif authorization and authorization.startswith("Bearer "):
        identifier = authorization.replace("Bearer ", "").strip()
    elif auth_user_id:
        identifier = str(auth_user_id).strip()

    if not identifier:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please provide X-User-Id header or user_id query parameter.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Search by integer ID or Email
    user = None
    if identifier.isdigit():
        user = db.query(User).filter(User.id == int(identifier)).first()
    else:
        user = db.query(User).filter(User.email == identifier).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authenticated user '{identifier}' not found in system.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user
