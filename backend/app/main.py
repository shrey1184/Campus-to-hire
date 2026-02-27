from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError

from app.config import settings
from app.database import engine, Base
from app.middleware import ErrorHandlerMiddleware, RateLimitMiddleware
from app.middleware.error_handler import (
    http_exception_handler,
    validation_exception_handler,
)
from app.routers import (
    auth,
    profile,
    roadmap,
    daily_plan,
    interview,
    jd,
    translate,
    progress,
    content,
    dashboard,
)

# Optional dev-only bootstrap.
# Prefer Alembic migrations for normal setup.
if settings.AUTO_CREATE_TABLES:
    Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Campus-to-Hire API",
    description="AI-powered personalization platform for Indian campus placements",
    version="1.0.0",
)

# Rate limiting middleware
app.add_middleware(
    RateLimitMiddleware,
    requests_per_minute=settings.RATE_LIMIT_REQUESTS_PER_MINUTE,
    burst_size=settings.RATE_LIMIT_BURST_SIZE,
    exempt_methods={"OPTIONS"},
    exempt_paths={"/", "/health", "/openapi.json", "/api/profile"},
    exempt_path_prefixes={"/docs", "/redoc", "/api/auth"},
)

# Global error handling middleware (must be last to catch all errors)
app.add_middleware(ErrorHandlerMiddleware)

# CORS should be outermost so error responses still include CORS headers.
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register exception handlers
app.add_exception_handler(Exception, http_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)

# Register routers
app.include_router(auth.router)
app.include_router(profile.router)
app.include_router(roadmap.router)
app.include_router(daily_plan.router)
app.include_router(interview.router)
app.include_router(jd.router)
app.include_router(translate.router)
app.include_router(progress.router)
app.include_router(content.router)
app.include_router(dashboard.router)


@app.get("/")
def root():
    return {"status": "ok", "message": "Campus-to-Hire API is running"}


@app.get("/health")
def health():
    return {"status": "healthy"}
