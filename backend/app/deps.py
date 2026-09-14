from fastapi import Depends, Request

from app.core import security
from app.core.errors import AppError
from app.core.permissions import resolve_user_permissions
from app.database import SessionLocal


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


class CurrentUser(object):
    def __init__(self, id):
        self.id = id


def get_current_user(request: Request):
    header = request.headers.get('authorization') or ''
    if not header.startswith('Bearer '):
        raise AppError.unauthorized('No token provided')

    token = header.split(' ', 1)[1]
    try:
        payload = security.verify_access_token(token)
    except Exception:
        raise AppError.unauthorized('Invalid or expired token')

    if payload.get('type') != 'access':
        raise AppError.unauthorized('Invalid token type')

    return CurrentUser(id=int(payload['sub']))


def require_permission(slug):
    def dependency(db=Depends(get_db), user=Depends(get_current_user)):
        resolved = resolve_user_permissions(db, user.id)
        if slug not in resolved['permissions']:
            raise AppError.forbidden()
        return user

    return dependency