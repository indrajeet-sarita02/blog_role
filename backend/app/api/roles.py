from typing import List, Optional

from fastapi import APIRouter, Body, Depends, Path, Query, Request
from pydantic import BaseModel

from app.core import responses
from app.core.context import capture
from app.deps import get_current_user, get_db, require_permission
from app.schemas import PermissionData, RoleData, RoleDetail
from app.services import role_service


class CreateRoleBody(BaseModel):
    name: str
    slug: Optional[str] = None
    description: Optional[str] = None


class UpdateRoleBody(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None


class UpdateRolePermissionsBody(BaseModel):
    permissionIds: List[int]


router = APIRouter()


def _query(page, limit, search, sort, order):
    return {'page': page, 'limit': limit, 'search': search, 'sort': sort, 'order': order}


@router.get('', status_code=200)
def list_roles(
    request: Request,
    db=Depends(get_db),
    _perm=Depends(require_permission('role.view')),
    page: Optional[str] = Query(None),
    limit: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    sort: Optional[str] = Query(None),
    order: Optional[str] = Query(None),
):
    capture(request)
    result = role_service.list_roles(db, _query(page, limit, search, sort, order))
    return responses.list_response(responses.os(result['items'], RoleData), result['meta'], 'Roles retrieved')


@router.post('', status_code=201)
def create_role(
    request: Request,
    db=Depends(get_db),
    user=Depends(get_current_user),
    _perm=Depends(require_permission('role.create')),
    body: CreateRoleBody = Body(...),
):
    capture(request)
    role = role_service.create_role(db, body.dict(exclude_unset=True), user.id)
    return responses.created(responses.o(role, RoleDetail), 'Role created successfully')


@router.get('/{role_id}', status_code=200)
def get_role(
    request: Request,
    db=Depends(get_db),
    _perm=Depends(require_permission('role.view')),
    role_id: int = Path(..., gt=0),
):
    capture(request)
    role = role_service.get_role(db, role_id)
    return responses.ok(responses.o(role, RoleDetail), 'Role retrieved')


@router.put('/{role_id}', status_code=200)
def update_role(
    request: Request,
    db=Depends(get_db),
    user=Depends(get_current_user),
    _perm=Depends(require_permission('role.update')),
    role_id: int = Path(..., gt=0),
    body: UpdateRoleBody = Body(...),
):
    capture(request)
    role = role_service.update_role(db, role_id, body.dict(exclude_unset=True), user.id)
    return responses.ok(responses.o(role, RoleDetail), 'Role updated successfully')


@router.delete('/{role_id}', status_code=204)
def delete_role(
    request: Request,
    db=Depends(get_db),
    user=Depends(get_current_user),
    _perm=Depends(require_permission('role.delete')),
    role_id: int = Path(..., gt=0),
):
    capture(request)
    role_service.delete_role(db, role_id, user.id)
    return responses.no_content()


@router.get('/{role_id}/permissions', status_code=200)
def get_role_permissions(
    request: Request,
    db=Depends(get_db),
    _perm=Depends(require_permission('role.view')),
    role_id: int = Path(..., gt=0),
):
    capture(request)
    permissions = role_service.get_role_permissions(db, role_id)
    return responses.ok(responses.os(permissions, PermissionData), 'Role permissions retrieved')


@router.put('/{role_id}/permissions', status_code=200)
def update_role_permissions(
    request: Request,
    db=Depends(get_db),
    user=Depends(get_current_user),
    _perm=Depends(require_permission('role.assignPermission')),
    role_id: int = Path(..., gt=0),
    body: UpdateRolePermissionsBody = Body(...),
):
    capture(request)
    permissions = role_service.update_role_permissions(db, role_id, body.permissionIds, user.id)
    return responses.ok(responses.os(permissions, PermissionData), 'Role permissions updated')