from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.user import UserResponse

router = APIRouter(prefix="/users", tags=["Users"])


@router.get(
    "",
    response_model=List[UserResponse],
    summary="List all users",
)
def get_all_users(db: Session = Depends(get_db)):
    """Retrieve all registered users in the system for sharing dialogs."""
    users = db.query(User).order_by(User.id.asc()).all()
    return users
