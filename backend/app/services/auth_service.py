from datetime import datetime

from app.config import Const
from app.core import security
from app.core.errors import AppError
from app.models import Role, User, UserRole


def _token_pair(user_id):
    return {
        'accessToken': security.sign_access_token(user_id),
        'refreshToken': security.sign_refresh_token(user_id),
    }


def _auth_user(user):
    return {'id': user.id, 'name': user.name, 'email': user.email}


def register(db, data):
    existing = db.query(User).filter(User.email == data['email']).first()
    if existing:
        raise AppError.conflict('Email is already registered')

    user = User(
        name=data['name'],
        email=data['email'],
        passwordHash=security.hash_password(data['password']),
        status=Const.USER_ACTIVE,
    )
    db.add(user)
    db.flush()

    user_role = db.query(Role).filter(Role.slug == 'user').first()
    if user_role:
        db.add(UserRole(userId=user.id, roleId=user_role.id))

    db.commit()
    db.refresh(user)

    return {**_token_pair(user.id), 'user': _auth_user(user)}


def login(db, data):
    user = db.query(User).filter(User.email == data['email']).first()
    if not user:
        raise AppError.unauthorized('Invalid email or password')
    if user.status != Const.USER_ACTIVE:
        raise AppError.forbidden('Account is not active')
    if not security.verify_password(data['password'], user.passwordHash):
        raise AppError.unauthorized('Invalid email or password')

    user.lastLoginAt = datetime.utcnow()
    db.commit()
    db.refresh(user)

    return {**_token_pair(user.id), 'user': _auth_user(user)}


def refresh(db, data):
    try:
        payload = security.verify_refresh_token(data['refreshToken'])
    except Exception:
        raise AppError.unauthorized('Invalid or expired refresh token')

    if payload.get('type') != 'refresh':
        raise AppError.unauthorized('Invalid token type')

    user = db.query(User).filter(User.id == int(payload['sub']), User.deletedAt.is_(None)).first()
    if not user or user.status != Const.USER_ACTIVE:
        raise AppError.unauthorized('Invalid or expired refresh token')

    return _token_pair(user.id)


def get_me(db, user_id):
    user = db.query(User).filter(User.id == user_id, User.deletedAt.is_(None)).first()
    if not user:
        raise AppError.not_found('User not found')
    return user