import os
from typing import List, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


def get_default_db_url() -> str:
    # Vercel Serverless filesystem is read-only except for /tmp
    if os.environ.get("VERCEL") or os.environ.get("AWS_LAMBDA_FUNCTION_NAME"):
        return "sqlite:////tmp/ajaia_docs.db"
    return "sqlite:///./ajaia_docs.db"


class Settings(BaseSettings):
    PROJECT_NAME: str = "Ajaia Docs"
    API_V1_STR: str = "/api"
    DATABASE_URL: str = get_default_db_url()
    CORS_ORIGINS: Union[List[str], str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "https://frontend-delta-cyan-95.vercel.app",
        "https://collaborative-docs-editor-omega.vercel.app",
    ]
    ENVIRONMENT: str = "development"

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, list):
            return v
        return v

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )


settings = Settings()
