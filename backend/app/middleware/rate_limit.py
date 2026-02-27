"""Rate limiting middleware for the Campus-to-Hire API."""

from __future__ import annotations

import logging
import math
import time
from typing import Any, Iterable

from fastapi import Request, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.responses import Response

logger = logging.getLogger(__name__)


class RateLimitMiddleware(BaseHTTPMiddleware):
    """In-memory rate limiting middleware.
    
    This middleware implements a sliding window rate limiter.
    For production with multiple instances, consider using Redis.
    
    Attributes:
        requests_per_minute: Maximum number of requests allowed per minute.
        burst_size: Maximum burst size allowed.
    """
    
    def __init__(
        self,
        app: Any,
        requests_per_minute: int = 100,
        burst_size: int = 20,
        exempt_paths: Iterable[str] | None = None,
        exempt_path_prefixes: Iterable[str] | None = None,
        exempt_methods: Iterable[str] | None = None,
    ):
        super().__init__(app)
        self.requests_per_minute = requests_per_minute
        self.burst_size = burst_size
        self.exempt_paths = set(exempt_paths or {"/health", "/"})
        self.exempt_path_prefixes = tuple(exempt_path_prefixes or ())
        self.exempt_methods = {
            method.upper() for method in (exempt_methods or {"OPTIONS"})
        }
        # Store: {client_ip: [(timestamp1, count1), (timestamp2, count2), ...]}
        self._requests: dict[str, list[tuple[float, int]]] = {}
        self._cleanup_interval = 300  # Cleanup every 5 minutes
        self._last_cleanup = time.time()
    
    async def dispatch(
        self, request: Request, call_next: RequestResponseEndpoint
    ) -> Response:
        # Skip rate limiting for configured methods and paths.
        if self._is_exempt_request(request):
            return await call_next(request)
        
        # Get client identifier (IP address or API key)
        client_id = self._get_client_id(request)
        
        # Check rate limit
        is_allowed, retry_after = self._is_allowed(client_id)
        if not is_allowed:
            logger.warning(
                f"Rate limit exceeded for client: {client_id}",
                extra={
                    "client_id": client_id,
                    "path": request.url.path,
                    "method": request.method,
                },
            )
            return self._create_rate_limit_response(client_id, retry_after)
        
        # Add rate limit headers to response
        response = await call_next(request)
        self._add_rate_limit_headers(response, client_id)
        
        return response

    def _is_exempt_request(self, request: Request) -> bool:
        """Check whether this request should bypass rate limiting."""
        method = request.method.upper()
        path = request.url.path
        if method in self.exempt_methods:
            return True
        if path in self.exempt_paths:
            return True
        return any(path.startswith(prefix) for prefix in self.exempt_path_prefixes)
    
    def _get_client_id(self, request: Request) -> str:
        """Get a unique identifier for the client.
        
        Priority:
        1. X-API-Key header
        2. X-Forwarded-For header (first IP)
        3. X-Real-IP header
        4. request.client.host
        """
        # Check for API key
        api_key = request.headers.get("X-API-Key")
        if api_key:
            return f"api:{api_key}"
        
        # Check forwarded headers (for proxied requests)
        forwarded_for = request.headers.get("X-Forwarded-For")
        if forwarded_for:
            # Take the first IP in the chain
            return forwarded_for.split(",")[0].strip()
        
        real_ip = request.headers.get("X-Real-IP")
        if real_ip:
            return real_ip
        
        # Fallback to direct client IP
        if request.client:
            return request.client.host
        
        return "unknown"
    
    def _is_allowed(self, client_id: str) -> tuple[bool, int]:
        """Check if the request is within rate limits.

        Two independent checks:
        - **Rate limit**: ``requests_per_minute`` over a 60-second window.
        - **Burst limit**: ``burst_size`` over a short 10-second window to
          prevent sudden spikes.
        """
        now = time.time()
        window_start = now - 60  # 1 minute window
        burst_window_start = now - 10  # 10 second burst window
        
        # Cleanup old entries periodically
        if now - self._last_cleanup > self._cleanup_interval:
            self._cleanup_old_entries()
        
        # Get or create request history for client
        if client_id not in self._requests:
            self._requests[client_id] = []
        
        request_history = self._requests[client_id]
        
        # Count requests in each window
        requests_in_window = 0
        requests_in_burst = 0
        for timestamp, count in request_history:
            if timestamp > window_start:
                requests_in_window += count
                if timestamp > burst_window_start:
                    requests_in_burst += count
        
        # Check per-minute rate limit
        if requests_in_window >= self.requests_per_minute:
            oldest_window_request = min(
                (timestamp for timestamp, _ in request_history if timestamp > window_start),
                default=now,
            )
            retry_after = max(1, math.ceil(oldest_window_request + 60 - now))
            return False, retry_after

        # Check short-burst limit
        if requests_in_burst >= self.burst_size:
            oldest_burst_request = min(
                (timestamp for timestamp, _ in request_history if timestamp > burst_window_start),
                default=now,
            )
            retry_after = max(1, math.ceil(oldest_burst_request + 10 - now))
            return False, retry_after

        # Record this request
        if request_history and now - request_history[-1][0] < 1:
            # Increment count for the current second
            last_time, last_count = request_history[-1]
            request_history[-1] = (last_time, last_count + 1)
        else:
            # Add new entry
            request_history.append((now, 1))

        return True, 0
    
    def _cleanup_old_entries(self) -> None:
        """Remove old entries to prevent memory leaks."""
        now = time.time()
        window_start = now - 60
        
        for client_id in list(self._requests.keys()):
            self._requests[client_id] = [
                entry for entry in self._requests[client_id]
                if entry[0] > window_start
            ]
            
            # Remove empty entries
            if not self._requests[client_id]:
                del self._requests[client_id]
        
        self._last_cleanup = now
        logger.debug(f"Rate limit cleanup complete. Active clients: {len(self._requests)}")
    
    def _get_remaining_requests(self, client_id: str) -> int:
        """Get remaining requests for the client."""
        if client_id not in self._requests:
            return self.requests_per_minute
        
        now = time.time()
        window_start = now - 60
        
        requests_in_window = sum(
            count for timestamp, count in self._requests[client_id]
            if timestamp > window_start
        )
        
        return max(0, self.requests_per_minute - requests_in_window)
    
    def _get_reset_time(self, client_id: str) -> int:
        """Get seconds until rate limit resets."""
        if client_id not in self._requests or not self._requests[client_id]:
            return 0
        
        now = time.time()
        window_start = now - 60
        
        # Find the oldest request in the window
        oldest_request = now
        for timestamp, _ in self._requests[client_id]:
            if timestamp > window_start and timestamp < oldest_request:
                oldest_request = timestamp
        
        reset_time = int(oldest_request + 60 - now)
        return max(0, reset_time)
    
    def _add_rate_limit_headers(self, response: Response, client_id: str) -> None:
        """Add rate limit information to response headers."""
        remaining = self._get_remaining_requests(client_id)
        reset_time = self._get_reset_time(client_id)
        
        response.headers["X-RateLimit-Limit"] = str(self.requests_per_minute)
        response.headers["X-RateLimit-Remaining"] = str(remaining)
        response.headers["X-RateLimit-Reset"] = str(reset_time)
        response.headers["X-RateLimit-Window"] = "60"
    
    def _create_rate_limit_response(self, client_id: str, retry_after: int) -> JSONResponse:
        """Create a rate limit exceeded response."""
        reset_time = max(retry_after, self._get_reset_time(client_id))
        return JSONResponse(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            headers={
                "Retry-After": str(retry_after),
                "X-RateLimit-Limit": str(self.requests_per_minute),
                "X-RateLimit-Remaining": "0",
                "X-RateLimit-Reset": str(reset_time),
                "X-RateLimit-Window": "60",
            },
            content={
                "success": False,
                "error": {
                    "code": "RATE_LIMIT_EXCEEDED",
                    "message": (
                        f"Rate limit exceeded. "
                        f"Limit: {self.requests_per_minute} requests per minute. "
                        f"Please try again later."
                    ),
                    "status_code": status.HTTP_429_TOO_MANY_REQUESTS,
                    "retry_after": retry_after,
                },
            },
        )


class RateLimitByPathMiddleware(RateLimitMiddleware):
    """Rate limiting middleware with different limits per path.
    
    Example:
        - Auth endpoints: 10 requests/minute
        - API endpoints: 100 requests/minute
        - Health checks: No limit
    """
    
    def __init__(
        self,
        app: Any,
        default_limit: int = 100,
        auth_limit: int = 10,
        burst_multiplier: float = 1.5,
    ):
        super().__init__(app, requests_per_minute=default_limit)
        self.default_limit = default_limit
        self.auth_limit = auth_limit
        self.burst_multiplier = burst_multiplier
        
        # Path patterns and their limits
        self.path_limits: dict[str, int] = {
            "/api/login": auth_limit,
            "/api/register": auth_limit,
            "/api/auth": auth_limit,
            "/api/token": auth_limit,
        }
    
    def _get_limit_for_path(self, path: str) -> int:
        """Get rate limit for a specific path."""
        for pattern, limit in self.path_limits.items():
            if path.startswith(pattern):
                return limit
        return self.default_limit
    
    async def dispatch(
        self, request: Request, call_next: RequestResponseEndpoint
    ) -> Response:
        # Skip rate limiting for configured methods and paths.
        if self._is_exempt_request(request):
            return await call_next(request)
        
        # Update limits based on path
        self.requests_per_minute = self._get_limit_for_path(request.url.path)
        self.burst_size = int(self.requests_per_minute * self.burst_multiplier)
        
        return await super().dispatch(request, call_next)
