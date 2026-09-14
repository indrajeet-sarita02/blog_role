from typing import Optional

from fastapi import APIRouter, Depends, Path, Query, Request

from app.core import responses
from app.core.context import capture
from app.deps import get_db, require_permission
from app.schemas import PermissionData
from app.services import permission_service

router = APIRouter()


def _query(page, limit, module, search, sort, order):
    return {'page': page, 'limit': limit, 'module': module, 'search': search, 'sort': sort, 'order': order}


@router.get('', status_code=200)
def list_permissions(
    request: Request,
    db=Depends(get_db),
    _perm=Depends(require_permission('permission.view')),
    page: Optional[str] = Query(None),
    limit: Optional[str] = Query(None),
    module: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    sort: Optional[str] = Query(None),
    order: Optional[str] = Query(None),
):
    capture(request)
    result = permission_service.list_permissions(db, _query(page, limit, module, search, sort, order))
    return responses.list_response(
        responses.os(result['items'], PermissionData), result['meta'], 'Permissions retrieved',
    )


@router.get('/{permission_id}', status_code=200)
def get_permission(
    request: Request,
    db=Depends(get_db),
    _perm=Depends(require_permission('permission.view')),
    permission_id: int = Path(..., gt=0),
):
    capture(request)
    permission = permission_service.get_permission(db, permission_id)
    return responses.ok(responses.o(permission, PermissionData), 'Permission retrieved')