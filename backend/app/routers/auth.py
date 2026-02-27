from datetime import timedelta
from urllib.parse import urlencode
import httpx

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from app.auth import (
    ACCESS_TOKEN_EXPIRE_DAYS,
    create_access_token,
    hash_password,
    verify_password,
    verify_token,
)
from app.config import settings
from app.database import get_db
from app.models import User
from app.schemas import (
    AuthLoginRequest,
    AuthRefreshRequest,
    AuthRegisterRequest,
    AuthResponse,
    GoogleCallbackRequest,
    UserProfile,
)

router = APIRouter(prefix="/api/auth", tags=["auth"])


def _normalize_email(email: str) -> str:
    normalized = email.strip().lower()
    if "@" not in normalized or "." not in normalized.split("@")[-1]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please provide a valid email address.",
        )
    return normalized


def _issue_auth_response(user: User) -> AuthResponse:
    token = create_access_token(
        user_id=user.id,
        email=user.email,
        name=user.name,
        expires_delta=timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS),
    )
    return AuthResponse(
        access_token=token,
        token_type="bearer",
        user=UserProfile.model_validate(user),
    )


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register(
    body: AuthRegisterRequest,
    db: Session = Depends(get_db),
) -> AuthResponse:
    email = _normalize_email(body.email)
    name = (body.name or email.split("@")[0]).strip()
    if not name:
        name = email.split("@")[0]

    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        )

    user = User(
        email=email,
        name=name,
        password_hash=hash_password(body.password),
        auth_provider="local",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return _issue_auth_response(user)


@router.post("/login", response_model=AuthResponse)
def login(
    body: AuthLoginRequest,
    db: Session = Depends(get_db),
) -> AuthResponse:
    email = _normalize_email(body.email)
    user = db.query(User).filter(User.email == email).first()

    if user is None or not user.password_hash:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not verify_password(body.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return _issue_auth_response(user)


@router.post("/refresh", response_model=AuthResponse)
def refresh_access_token(
    body: AuthRefreshRequest,
    db: Session = Depends(get_db),
) -> AuthResponse:
    payload = verify_token(body.access_token)

    user: User | None = None
    user_id = payload.get("sub")
    email = payload.get("email")

    if user_id:
        user = db.query(User).filter(User.id == user_id).first()
    if user is None and email:
        user = db.query(User).filter(User.email == email).first()

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found for token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return _issue_auth_response(user)


@router.get("/google/login")
async def google_login():
    """Initiate Google OAuth login flow"""
    if not settings.GOOGLE_CLIENT_ID or not settings.GOOGLE_CLIENT_SECRET:
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="Google OAuth is not configured"
        )
    
    # Build Google OAuth URL with proper encoding
    params = {
        "client_id": settings.GOOGLE_CLIENT_ID,
        "redirect_uri": settings.GOOGLE_REDIRECT_URI,
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "offline",
        "prompt": "consent"
    }
    
    auth_url = f"https://accounts.google.com/o/oauth2/v2/auth?{urlencode(params)}"
    
    return RedirectResponse(url=auth_url)


@router.post("/google/callback", response_model=AuthResponse)
async def google_callback(
    body: GoogleCallbackRequest,
    db: Session = Depends(get_db),
) -> AuthResponse:
    """Handle Google OAuth callback"""
    if not settings.GOOGLE_CLIENT_ID or not settings.GOOGLE_CLIENT_SECRET:
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="Google OAuth is not configured"
        )
    
    try:
        # Exchange authorization code for access token
        async with httpx.AsyncClient() as client:
            token_response = await client.post(
                "https://oauth2.googleapis.com/token",
                data={
                    "code": body.code,
                    "client_id": settings.GOOGLE_CLIENT_ID,
                    "client_secret": settings.GOOGLE_CLIENT_SECRET,
                    "redirect_uri": settings.GOOGLE_REDIRECT_URI,
                    "grant_type": "authorization_code",
                },
            )
            
            if token_response.status_code != 200:
                token_error = token_response.json() if token_response.headers.get("content-type", "").startswith("application/json") else {}
                token_error_message = (
                    token_error.get("error_description")
                    or token_error.get("error")
                    or "Failed to exchange authorization code"
                )
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail=f"Google token exchange failed: {token_error_message}"
                )
            
            token_data = token_response.json()
            access_token = token_data.get("access_token")
            
            # Get user info from Google
            userinfo_response = await client.get(
                "https://www.googleapis.com/oauth2/v3/userinfo",
                headers={"Authorization": f"Bearer {access_token}"}
            )
            
            if userinfo_response.status_code != 200:
                userinfo_error = userinfo_response.json() if userinfo_response.headers.get("content-type", "").startswith("application/json") else {}
                userinfo_error_message = (
                    userinfo_error.get("error_description")
                    or userinfo_error.get("error")
                    or "Failed to get user info from Google"
                )
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail=f"Google user info failed: {userinfo_error_message}"
                )
            
            user_info = userinfo_response.json()
        
        email = user_info.get('email')
        name = user_info.get('name') or (email.split('@')[0] if email else 'User')
        avatar_url = user_info.get('picture')
        google_id = user_info.get('sub')
        
        if not email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email not provided by Google"
            )
        
        # Check if user exists
        user = db.query(User).filter(User.email == email).first()
        
        if user:
            # Update existing user
            if not user.google_id:
                user.google_id = google_id
            if not user.avatar_url:
                user.avatar_url = avatar_url
            user.auth_provider = "google"
        else:
            # Create new user
            user = User(
                email=email,
                name=name,
                avatar_url=avatar_url,
                google_id=google_id,
                auth_provider="google",
                password_hash=None,  # No password for OAuth users
            )
            db.add(user)
        
        db.commit()
        db.refresh(user)
        
        return _issue_auth_response(user)
        
    except HTTPException:
        raise
    except httpx.HTTPError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"OAuth authentication failed: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred during authentication: {str(e)}"
        )
