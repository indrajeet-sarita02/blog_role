import threading
import time

from fastapi import Request
from fastapi.responses import JSONResponse

from app.config import Const

_lock = threading.Lock()
_buckets = {}


class FixedWindowLimiter(object):
    def __init__(self, max_requests, window_seconds):
        self.max_requests = max_requests
        self.window_seconds = window_seconds

    def allow(self, key):
        now = time.time()
        window_start = int(now // self.window_seconds) * self.window_seconds
        with _lock:
            bucket = _buckets.get(key)
            if not bucket or bucket[0] != window_start:
                _buckets[key] = (window_start, 1)
                return True
            count = bucket[1]
            if count >= self.max_requests:
                return False
            _buckets[key] = (window_start, count + 1)
            return True


_auth_limiter = FixedWindowLimiter(20, 15 * 60)
_api_limiter = FixedWindowLimiter(300, 15 * 60)


def _client_key(request):
    xff = request.headers.get('x-forwarded-for')
    ip = (xff.split(',')[0].strip() if xff else None) or (request.client.host if request.client else 'unknown')
    return str(ip)


def check_rate_limit(request: Request):
    path = request.url.path
    if not path.startswith(Const.API_BASE):
        return None
    key = _client_key(request)
    if path == Const.API_BASE + '/auth' or path.startswith(Const.API_BASE + '/auth/'):
        allowed = _auth_limiter.allow(key)
    else:
        allowed = _api_limiter.allow(key)
    if not allowed:
        return JSONResponse(
            status_code=429,
            content={
                'success': False,
                'message': 'Too many requests, please try again later',
                'error': {'code': 'RATE_LIMITED', 'details': None},
            },
        )
    return None