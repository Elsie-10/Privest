"""
Environment-driven settings. Nothing here is hardcoded — all secrets and
per-environment values come from the process environment (.env locally,
real environment variables in AWS).
"""

from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # General
    environment: str = "development"
    api_prefix: str = "/api"

    # CORS — the Next.js dev server / deployed frontend origin(s), comma-separated.
    cors_origins: str = "http://localhost:3000"

    # Database (Postgres). Optional: if unset, snapshot persistence is
    # disabled and the API operates in stateless "analyze only" mode —
    # useful for local dev before Postgres is provisioned.
    database_url: str | None = None

    # AI layer. Set one of these depending on which service backs
    # /api/ai/*. ANTHROPIC_API_KEY talks to api.anthropic.com directly
    # (same key the old app/api/insights/route.ts used); BACKBOARD_API_KEY
    # / BACKBOARD_API_URL route through Backboard AI instead, per the
    # target architecture's AI layer.
    anthropic_api_key: str | None = None
    anthropic_model: str = "claude-sonnet-4-6"

    backboard_api_key: str | None = None
    backboard_api_url: str | None = None

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def ai_enabled(self) -> bool:
        return bool(self.anthropic_api_key or (self.backboard_api_key and self.backboard_api_url))

    @property
    def db_enabled(self) -> bool:
        return bool(self.database_url)


@lru_cache
def get_settings() -> Settings:
    return Settings()
