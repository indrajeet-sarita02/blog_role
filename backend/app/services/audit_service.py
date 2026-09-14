from app.core.errors import AppError
from app.core.pagination import order_by_clause, parse_pagination
from app.models import AuditLog


def list_audit_logs(db, filters):
    page, limit, offset, sort, order = parse_pagination(filters)

    q = db.query(AuditLog)
    if filters.get('action'):
        q = q.filter(AuditLog.action == filters['action'])
    if filters.get('module'):
        q = q.filter(AuditLog.module == filters['module'])
    if filters.get('userId'):
        q = q.filter(AuditLog.userId == int(filters['userId']))
    if filters.get('search'):
        term = '%{}%'.format(filters['search'])
        q = q.filter(db.or_(AuditLog.action.like(term), AuditLog.entityType.like(term)))

    total = q.count()
    logs = q.order_by(order_by_clause(AuditLog, sort, order)).offset(offset).limit(limit).all()

    return {
        'items': logs,
        'meta': {'page': page, 'limit': limit, 'total': total, 'totalPages': (total + limit - 1) // limit},
    }


def get_audit_log(db, log_id):
    log = db.query(AuditLog).filter(AuditLog.id == log_id).first()
    if not log:
        raise AppError.not_found('Audit log not found')
    return log