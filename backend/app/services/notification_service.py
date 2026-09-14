from datetime import datetime

from app.core.errors import AppError
from app.core.pagination import order_by_clause, parse_pagination
from app.models import Notification


def list_notifications(db, actor_id, filters):
    page, limit, offset, sort, order = parse_pagination(filters)

    q = db.query(Notification).filter(Notification.userId == actor_id)
    if filters.get('type'):
        q = q.filter(Notification.type == filters['type'])
    if filters.get('unread') == 'true':
        q = q.filter(Notification.readAt.is_(None))
    elif filters.get('unread') == 'false':
        q = q.filter(Notification.readAt.isnot(None))

    total = q.count()
    notifications = q.order_by(order_by_clause(Notification, sort, order)).offset(offset).limit(limit).all()
    unread_count = db.query(Notification).filter(
        Notification.userId == actor_id, Notification.readAt.is_(None)
    ).count()

    return {
        'items': notifications,
        'unreadCount': unread_count,
        'meta': {'page': page, 'limit': limit, 'total': total, 'totalPages': (total + limit - 1) // limit},
    }


def mark_notification_read(db, notification_id, actor_id):
    notification = (
        db.query(Notification)
        .filter(Notification.id == notification_id, Notification.userId == actor_id)
        .first()
    )
    if not notification:
        raise AppError.not_found('Notification not found')
    if notification.readAt is None:
        notification.readAt = datetime.utcnow()
        db.commit()
    return notification


def mark_all_notifications_read(db, actor_id):
    db.query(Notification).filter(
        Notification.userId == actor_id, Notification.readAt.is_(None)
    ).update({'readAt': datetime.utcnow()}, synchronize_session=False)
    db.commit()
    return {'updated': True}


def delete_notification(db, notification_id, actor_id):
    notification = (
        db.query(Notification)
        .filter(Notification.id == notification_id, Notification.userId == actor_id)
        .first()
    )
    if not notification:
        raise AppError.not_found('Notification not found')
    db.delete(notification)
    db.commit()