from datetime import datetime, timedelta, timezone

import bcrypt
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models import User

security = HTTPBearer()

ACCESS_TOKEN_EXPIRE_DAYS = 7

# bcrypt silently truncates passwords longer than 72 bytes.
# We truncate explicitly to make the behaviour obvious.
_BCRYPT_MAX_BYTES = 72


def _prep_password(password: str) -> bytes:
    """Encode and truncate a password to 72 bytes for bcrypt."""
    return password.encode("utf-8")[:_BCRYPT_MAX_BYTES]


def hash_password(password: str) -> str:
    pw = _prep_password(password)
    return bcrypt.hashpw(pw, bcrypt.gensalt()).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    pw = _prep_password(plain_password)
    return bcrypt.checkpw(pw, hashed_password.encode("utf-8"))


def create_access_token(
    *,
    user_id: str,
    email: str,
    name: str,
    expires_delta: timedelta | None = None,
) -> str:
    now = datetime.now(timezone.utc)
    expire = now + (expires_delta or timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS))
    payload: dict = {
        "sub": user_id,
        "email": email,
        "name": name,
        "iat": int(now.timestamp()),
        "exp": int(expire.timestamp()),
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def verify_token(token: str) -> dict:
    try:
        payload: dict = jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM],
        )
        return payload
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token.",
            headers={"WWW-Authenticate": "Bearer"},
        )


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    token = credentials.credentials
    payload = verify_token(token)

    user: User | None = None
    user_id: str | None = payload.get("sub")
    email: str | None = payload.get("email")

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

    return user
