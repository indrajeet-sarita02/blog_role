from typing import Optional

from fastapi import APIRouter, Depends, Path, Query, Request

from app.core import responses
from app.core.context import capture
from app.deps import get_current_user, get_db
from app.schemas import NotificationData
from app.services import notification_service

router = APIRouter(tags=['Notifications'])


def _query(page, limit, unread, type_, sort, order):
    return {'page': page, 'limit': limit, 'unread': unread, 'type': type_, 'sort': sort, 'order': order}


@router.get('', status_code=200)
def list_notifications(
    request: Request,
    db=Depends(get_db),
    user=Depends(get_current_user),
    page: Optional[str] = Query(None),
    limit: Optional[str] = Query(None),
    unread: Optional[str] = Query(None),
    type: Optional[str] = Query(None),
    sort: Optional[str] = Query(None),
    order: Optional[str] = Query(None),
):
    capture(request)
    result = notification_service.list_notifications(db, user.id, _query(page, limit, unread, type, sort, order))
    meta = dict(result['meta'])
    meta['unreadCount'] = result['unreadCount']
    return responses.list_response(
        responses.os(result['items'], NotificationData), meta, 'Notifications retrieved',
    )


@router.patch('/read-all', status_code=200)
def mark_all_read(
    request: Request,
    db=Depends(get_db),
    user=Depends(get_current_user),
):
    capture(request)
    result = notification_service.mark_all_notifications_read(db, user.id)
    return responses.ok(result, 'All notifications marked as read')


@router.patch('/{notification_id}/read', status_code=200)
def mark_read(
    request: Request,
    db=Depends(get_db),
    user=Depends(get_current_user),
    notification_id: int = Path(..., gt=0),
):
    capture(request)
    notification = notification_service.mark_notification_read(db, notification_id, user.id)
    return responses.ok(responses.o(notification, NotificationData), 'Notification marked as read')


@router.delete('/{notification_id}', status_code=204)
def delete_notification(
    request: Request,
    db=Depends(get_db),
    user=Depends(get_current_user),
    notification_id: int = Path(..., gt=0),
):
    capture(request)
    notification_service.delete_notification(db, notification_id, user.id)
    return responses.no_content()