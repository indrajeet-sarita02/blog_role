from typing import List, Optional

from fastapi import APIRouter, Body, Depends, Path, Query, Request
from pydantic import BaseModel

from app.config import Const
from app.core import responses
from app.core.context import capture
from app.deps import get_current_user, get_db, require_permission
from app.schemas import UserList, UserProfile
from app.services import user_service


class CreateUserBody(BaseModel):
    name: str
    email: str
    password: str
    roleIds: Optional[List[int]] = None


class UpdateUserBody(BaseModel):
    name: Optional[str] = None
    avatar: Optional[str] = None
    bio: Optional[str] = None


class UpdateStatusBody(BaseModel):
    status: str


class UpdateRolesBody(BaseModel):
    roleIds: List[int]


router = APIRouter()


def _query(page, limit, search, status, sort, order):
    return {'page': page, 'limit': limit, 'search': search, 'status': status, 'sort': sort, 'order': order}


def _reply(result, message):
    return responses.list_response(responses.os(result['items'], UserList), result['meta'], message)


@router.get('', status_code=200)
def list_users(
    request: Request,
    db=Depends(get_db),
    _perm=Depends(require_permission('user.view')),
    page: Optional[str] = Query(None),
    limit: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    sort: Optional[str] = Query(None),
    order: Optional[str] = Query(None),
):
    capture(request)
    result = user_service.list_users(db, _query(page, limit, search, status, sort, order))
    return _reply(result, 'Users retrieved')


@router.post('', status_code=201)
def create_user(
    request: Request,
    db=Depends(get_db),
    user=Depends(get_current_user),
    _perm=Depends(require_permission('user.create')),
    body: CreateUserBody = Body(...),
):
    capture(request)
    created = user_service.create_user(db, body.dict(), user.id)
    return responses.created(responses.o(created, UserList), 'User created successfully')


@router.get('/{user_id}', status_code=200)
def get_user(
    request: Request,
    db=Depends(get_db),
    _perm=Depends(require_permission('user.view')),
    user_id: int = Path(..., gt=0),
):
    capture(request)
    user = user_service.get_user(db, user_id)
    return responses.ok(responses.o(user, UserList), 'User retrieved')


@router.put('/{user_id}', status_code=200)
def update_user(
    request: Request,
    db=Depends(get_db),
    _perm=Depends(require_permission('user.update')),
    user_id: int = Path(..., gt=0),
    body: UpdateUserBody = Body(...),
):
    capture(request)
    user = user_service.update_user(db, user_id, body.dict(exclude_unset=True))
    return responses.ok(responses.o(user, UserProfile), 'User updated successfully')


@router.patch('/{user_id}/status', status_code=200)
def update_user_status(
    request: Request,
    db=Depends(get_db),
    user=Depends(get_current_user),
    _perm=Depends(require_permission('user.update')),
    user_id: int = Path(..., gt=0),
    body: UpdateStatusBody = Body(...),
):
    capture(request)
    updated = user_service.update_user_status(db, user_id, body.status, user.id)
    return responses.ok(responses.o(updated, UserProfile), 'User status updated')


@router.put('/{user_id}/roles', status_code=200)
def update_user_roles(
    request: Request,
    db=Depends(get_db),
    user=Depends(get_current_user),
    _perm=Depends(require_permission('user.update')),
    user_id: int = Path(..., gt=0),
    body: UpdateRolesBody = Body(...),
):
    capture(request)
    updated = user_service.update_user_roles(db, user_id, body.roleIds, user.id)
    return responses.ok(responses.o(updated, UserList), 'User roles updated')


@router.delete('/{user_id}', status_code=204)
def delete_user(
    request: Request,
    db=Depends(get_db),
    user=Depends(get_current_user),
    _perm=Depends(require_permission('user.delete')),
    user_id: int = Path(..., gt=0),
):
    capture(request)
    user_service.delete_user(db, user_id, user.id)
    return responses.no_content()