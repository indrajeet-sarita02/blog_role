from app.core.audit import write_audit
from app.core.errors import AppError
from app.core.pagination import order_by_clause, parse_pagination
from app.core.slug import slugify
from app.models import Permission, Role, RolePermission


def list_roles(db, filters):
    page, limit, offset, sort, order = parse_pagination(filters)

    q = db.query(Role)
    if filters.get('search'):
        term = '%{}%'.format(filters['search'])
        q = q.filter(db.or_(Role.name.like(term), Role.slug.like(term)))

    total = q.count()
    roles = q.order_by(order_by_clause(Role, sort, order)).offset(offset).limit(limit).all()

    return {
        'items': roles,
        'meta': {'page': page, 'limit': limit, 'total': total, 'totalPages': (total + limit - 1) // limit},
    }


def get_role(db, role_id):
    role = db.query(Role).filter(Role.id == role_id).first()
    if not role:
        raise AppError.not_found('Role not found')
    return role


def create_role(db, data, actor_id):
    slug = data.get('slug') or slugify(data['name'])
    existing = db.query(Role).filter(Role.slug == slug).first()
    if existing:
        raise AppError.conflict('Role with this slug already exists')

    role = Role(
        name=data['name'],
        slug=slug,
        description=data.get('description'),
        isSystem=False,
    )
    db.add(role)
    db.flush()

    write_audit(db, actor_id, 'ROLE_CREATED', 'role', 'role', role.id,
                new={'name': role.name, 'slug': role.slug})
    db.commit()
    db.refresh(role)
    return role


def update_role(db, role_id, data, actor_id):
    role = db.query(Role).filter(Role.id == role_id).first()
    if not role:
        raise AppError.not_found('Role not found')

    old = {'name': role.name, 'description': role.description}
    if 'name' in data:
        role.name = data['name']
    if 'description' in data:
        role.description = data['description']

    write_audit(db, actor_id, 'ROLE_UPDATED', 'role', 'role', role_id,
                old=old, new={'name': role.name, 'description': role.description})
    db.commit()
    db.refresh(role)
    return role


def delete_role(db, role_id, actor_id):
    role = db.query(Role).filter(Role.id == role_id).first()
    if not role:
        raise AppError.not_found('Role not found')
    if role.isSystem:
        raise AppError.forbidden('System roles cannot be deleted')

    db.query(RolePermission).filter(RolePermission.roleId == role_id).delete(synchronize_session=False)
    db.delete(role)
    write_audit(db, actor_id, 'ROLE_DELETED', 'role', 'role', role_id,
                old={'name': role.name, 'slug': role.slug})
    db.commit()


def get_role_permissions(db, role_id):
    role = db.query(Role).filter(Role.id == role_id).first()
    if not role:
        raise AppError.not_found('Role not found')

    return (
        db.query(Permission)
        .join(Permission.roles)
        .filter(Role.id == role_id)
        .all()
    )


def update_role_permissions(db, role_id, permission_ids, actor_id):
    role = db.query(Role).filter(Role.id == role_id).first()
    if not role:
        raise AppError.not_found('Role not found')

    permissions = db.query(Permission).filter(Permission.id.in_(permission_ids)).all()
    if len(permissions) != len(permission_ids):
        raise AppError.bad_request('One or more permissions do not exist')

    db.query(RolePermission).filter(RolePermission.roleId == role_id).delete(synchronize_session=False)
    for permission_id in permission_ids:
        db.add(RolePermission(roleId=role_id, permissionId=permission_id))

    write_audit(db, actor_id, 'PERMISSION_ASSIGNED', 'role', 'role', role_id,
                new={'permissionIds': permission_ids})
    db.commit()

    return get_role_permissions(db, role_id)