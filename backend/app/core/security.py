import time

import bcrypt
import jwt as pyjwt

from app.config import JWT_ACCESS_EXPIRES_S, JWT_ACCESS_SECRET, JWT_REFRESH_EXPIRES_S, JWT_REFRESH_SECRET


def hash_password(plain):
    return bcrypt.hashpw(plain.encode('utf-8'), bcrypt.gensalt(rounds=10)).decode('utf-8')


def verify_password(plain, hashed):
    if not hashed:
        return False
    try:
        return bcrypt.checkpw(plain.encode('utf-8'), hashed.encode('utf-8'))
    except ValueError:
        return False


def _sign(secret, user_id, ttl, token_type):
    payload = {
        'type': token_type,
        'sub': str(user_id),
        'iat': int(time.time()),
        'exp': int(time.time()) + ttl,
    }
    return pyjwt.encode(payload, secret, algorithm='HS256')


def sign_access_token(user_id):
    return _sign(JWT_ACCESS_SECRET, user_id, JWT_ACCESS_EXPIRES_S, 'access')


def sign_refresh_token(user_id):
    return _sign(JWT_REFRESH_SECRET, user_id, JWT_REFRESH_EXPIRES_S, 'refresh')


def verify_access_token(token):
    return pyjwt.decode(token, JWT_ACCESS_SECRET, algorithms=['HS256'])


def verify_refresh_token(token):
    return pyjwt.decode(token, JWT_REFRESH_SECRET, algorithms=['HS256'])