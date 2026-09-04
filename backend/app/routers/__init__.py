from app.routers.auth import router as auth_router
from app.routers.documents import router as documents_router
from app.routers.users import router as users_router

__all__ = ["auth_router", "documents_router", "users_router"]
