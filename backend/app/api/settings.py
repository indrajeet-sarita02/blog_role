from typing import Any, Dict, Optional

from fastapi import APIRouter, Body, Depends, Query, Request

from app.core import responses
from app.core.context import capture
from app.deps import get_current_user, get_db, require_permission
from app.services import settings_service

router = APIRouter()


@router.get('', status_code=200)
def list_settings(
    request: Request,
    db=Depends(get_db),
    _perm=Depends(require_permission('settings.view')),
    search: Optional[str] = Query(None),
    page: Optional[str] = Query(None),
    limit: Optional[str] = Query(None),
):
    capture(request)
    result = settings_service.list_settings(db, {'search': search, 'page': page, 'limit': limit})
    return responses.list_response(result['settings'], result['meta'], 'Settings retrieved')


@router.put('', status_code=200)
def update_settings(
    request: Request,
    db=Depends(get_db),
    user=Depends(get_current_user),
    _perm=Depends(require_permission('settings.update')),
    body: Dict[str, Any] = Body(...),
):
    capture(request)
    settings = settings_service.update_settings(db, user.id, body)
    return responses.ok(settings, 'Settings updated successfully')