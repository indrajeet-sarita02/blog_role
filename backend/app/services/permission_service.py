from app.core.errors import AppError
from app.core.pagination import order_by_clause, parse_pagination
from app.models import Permission


def list_permissions(db, filters):
    page, limit, offset, sort, order = parse_pagination(filters)

    q = db.query(Permission)
    if filters.get('module'):
        q = q.filter(Permission.module == filters['module'])
    if filters.get('search'):
        term = '%{}%'.format(filters['search'])
        q = q.filter(db.or_(Permission.name.like(term), Permission.slug.like(term)))

    total = q.count()
    permissions = q.order_by(order_by_clause(Permission, sort, order)).offset(offset).limit(limit).all()

    return {
        'items': permissions,
        'meta': {'page': page, 'limit': limit, 'total': total, 'totalPages': (total + limit - 1) // limit},
    }


def get_permission(db, permission_id):
    permission = db.query(Permission).filter(Permission.id == permission_id).first()
    if not permission:
        raise AppError.not_found('Permission not found')
    return permission