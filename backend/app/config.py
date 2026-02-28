from __future__ import annotations

import json

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
    )

    # Database
    DATABASE_URL: str

    # JWT
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"

    # AWS
    AWS_REGION: str = "ap-south-1"
    AWS_ACCESS_KEY_ID: str
    AWS_SECRET_ACCESS_KEY: str

    # Amazon Bedrock
    BEDROCK_MODEL_ID: str = "anthropic.claude-3-haiku-20240307-v1:0"

    # CORS
    CORS_ORIGINS: list[str] | str = ["http://localhost:3000"]

    # API
    API_PREFIX: str = "/api"

    # Rate limiting
    RATE_LIMIT_REQUESTS_PER_MINUTE: int = 300
    RATE_LIMIT_BURST_SIZE: int = 100

    # Google OAuth
    GOOGLE_CLIENT_ID: str | None = None
    GOOGLE_CLIENT_SECRET: str | None = None
    GOOGLE_REDIRECT_URI: str = "http://localhost:3000/auth/callback/google"

    # Local bootstrap (disabled by default; prefer Alembic migrations)
    AUTO_CREATE_TABLES: bool = False

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, value: object) -> object:
        """Accept both JSON array and comma-separated CORS origin values."""
        if isinstance(value, str):
            raw = value.strip()
            if not raw:
                return []

            # JSON array format: ["http://localhost:3000", "..."]
            if raw.startswith("["):
                try:
                    parsed = json.loads(raw)
                    if isinstance(parsed, list):
                        return [str(item).strip() for item in parsed if str(item).strip()]
                except json.JSONDecodeError:
                    pass

            # Comma-separated format: http://localhost:3000,http://localhost:5173
            return [origin.strip() for origin in raw.split(",") if origin.strip()]

        return value


settings = Settings()
