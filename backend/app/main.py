import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.database import Base, SessionLocal, engine
from app.routers.auth import router as auth_router
from app.routers.documents import router as documents_router
from app.routers.users import router as users_router
from app.seed import seed_demo_users

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("ajaia_docs")


def init_db():
    try:
        Base.metadata.create_all(bind=engine)
        db = SessionLocal()
        try:
            seed_demo_users(db)
        finally:
            db.close()
    except Exception as e:
        logger.warning("Database auto-init notice: %s", e)

# Auto-initialize tables and seed data immediately (needed for serverless cold-starts)
init_db()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for database table creation and initial seeding."""
    logger.info("Initializing database schema...")
    init_db()
    yield
    logger.info("Application shutting down...")


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Backend API for Ajaia Docs - Collaborative Document Editor",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS configuration
origins = settings.CORS_ORIGINS
if isinstance(origins, str):
    origins = [o.strip() for o in origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins else ["*"],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.exception("Unhandled server error: %s", exc)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal server error occurred.", "type": type(exc).__name__},
    )


# Health Check Endpoints
@app.get("/health", tags=["Health"], summary="Health Check")
@app.get(f"{settings.API_V1_STR}/health", tags=["Health"], summary="API Health Check")
def health_check():
    return {
        "status": "ok",
        "app": settings.PROJECT_NAME,
        "environment": settings.ENVIRONMENT,
        "version": "0.1.0",
    }


@app.get("/", tags=["Root"], summary="Root Endpoint")
def root():
    return {
        "message": f"Welcome to {settings.PROJECT_NAME} API",
        "docs_url": "/docs",
        "health_check": "/health",
    }


# Include API Routers (supporting both /api/path and /path)
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(auth_router)

app.include_router(users_router, prefix=settings.API_V1_STR)
app.include_router(users_router)

app.include_router(documents_router, prefix=settings.API_V1_STR)
app.include_router(documents_router)

