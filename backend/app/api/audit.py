from typing import Optional

from fastapi import APIRouter, Depends, Path, Query, Request

from app.core import responses
from app.core.context import capture
from app.deps import get_db, require_permission
from app.schemas import AuditData
from app.services import audit_service

router = APIRouter()


def _query(page, limit, action, module, user_id, search, sort, order):
    return {
        'page': page,
        'limit': limit,
        'action': action,
        'module': module,
        'userId': user_id,
        'search': search,
        'sort': sort,
        'order': order,
    }


@router.get('', status_code=200)
def list_audit(
    request: Request,
    db=Depends(get_db),
    _perm=Depends(require_permission('audit.view')),
    page: Optional[str] = Query(None),
    limit: Optional[str] = Query(None),
    action: Optional[str] = Query(None),
    module: Optional[str] = Query(None),
    userId: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    sort: Optional[str] = Query(None),
    order: Optional[str] = Query(None),
):
    capture(request)
    result = audit_service.list_audit_logs(
        db, _query(page, limit, action, module, userId, search, sort, order),
    )
    return responses.list_response(
        responses.os(result['items'], AuditData), result['meta'], 'Audit logs retrieved',
    )


@router.get('/{log_id}', status_code=200)
def get_audit(
    request: Request,
    db=Depends(get_db),
    _perm=Depends(require_permission('audit.view')),
    log_id: int = Path(..., gt=0),
):
    capture(request)
    log = audit_service.get_audit_log(db, log_id)
    return responses.ok(responses.o(log, AuditData), 'Audit log retrieved')