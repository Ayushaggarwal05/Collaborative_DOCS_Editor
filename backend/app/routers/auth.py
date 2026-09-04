from typing import List, Optional
from fastapi import APIRouter, Depends, Header, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.user import AuthResponse, LoginRequest, UserResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.get("/users", response_model=List[UserResponse], summary="List demo users")
def list_demo_users(db: Session = Depends(get_db)):
    """Retrieve all available demo users for frontend user switching/selection."""
    users = db.query(User).all()
    return users


@router.post("/login", response_model=AuthResponse, summary="Demo Login")
def demo_login(payload: LoginRequest, db: Session = Depends(get_db)):
    """Simple demo login endpoint by user_id or email without complex passwords."""
    user = None
    if payload.user_id is not None:
        user = db.query(User).filter(User.id == payload.user_id).first()
    elif payload.email is not None:
        user = db.query(User).filter(User.email == payload.email).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found. Please select a valid demo user.",
        )

    return AuthResponse(
        user=user,
        message=f"Logged in as {user.name} ({user.email})",
    )


@router.get("/me", response_model=UserResponse, summary="Get current demo user")
def get_current_user(
    x_user_id: Optional[int] = Header(None, description="User ID sent in request header"),
    user_id: Optional[int] = Query(None, description="User ID sent as query parameter"),
    db: Session = Depends(get_db),
):
    """Retrieve the current user profile based on X-User-Id header or user_id query param."""
    target_id = x_user_id or user_id
    if target_id is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing user identification. Provide X-User-Id header or user_id query parameter.",
        )

    user = db.query(User).filter(User.id == target_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with ID {target_id} not found.",
        )

    return user
