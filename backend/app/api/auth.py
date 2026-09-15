from fastapi import APIRouter, Body, Depends, Request
from pydantic import BaseModel

from app.core import responses
from app.core.context import capture
from app.deps import get_current_user, get_db
from app.schemas import MeUser
from app.services import auth_service


class RegisterBody(BaseModel):
    name: str
    email: str
    password: str


class LoginBody(BaseModel):
    email: str
    password: str


class RefreshBody(BaseModel):
    refreshToken: str


router = APIRouter(tags=['Auth'])


def _auth_reply(result, message, status_code=200):
    data = {
        'accessToken': result['accessToken'],
        'refreshToken': result['refreshToken'],
        'user': result['user'],
    }
    if status_code == 201:
        return responses.created(data, message)
    return responses.ok(data, message)


@router.post('/register', status_code=201)
def register(request: Request, db=Depends(get_db), body: RegisterBody = Body(...)):
    capture(request)
    result = auth_service.register(db, body.dict())
    return _auth_reply(result, 'Registered successfully', 201)


@router.post('/login', status_code=200)
def login(request: Request, db=Depends(get_db), body: LoginBody = Body(...)):
    capture(request)
    result = auth_service.login(db, body.dict())
    return _auth_reply(result, 'Logged in successfully')


@router.post('/refresh', status_code=200)
def refresh(request: Request, db=Depends(get_db), body: RefreshBody = Body(...)):
    capture(request)
    result = auth_service.refresh(db, body.dict())
    return responses.ok(result, 'Token refreshed successfully')


@router.get('/me', status_code=200)
def me(request: Request, db=Depends(get_db), user=Depends(get_current_user)):
    capture(request)
    me = auth_service.get_me(db, user.id)
    return responses.ok(responses.o(me, MeUser), 'Current user retrieved')