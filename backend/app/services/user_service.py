from app.config import Const
from app.core.audit import write_audit
from app.core.errors import AppError
from app.core.pagination import order_by_clause, parse_pagination
from app.core import security
from app.models import Role, User, UserRole


def list_users(db, filters):
    page, limit, offset, sort, order = parse_pagination(filters)

    q = db.query(User).filter(User.deletedAt.is_(None))
    if filters.get('status'):
        q = q.filter(User.status == filters['status'])
    if filters.get('search'):
        term = '%{}%'.format(filters['search'])
        q = q.filter(db.or_(User.name.like(term), User.email.like(term)))

    total = q.count()
    users = q.order_by(order_by_clause(User, sort, order)).offset(offset).limit(limit).all()

    return {
        'items': users,
        'meta': {'page': page, 'limit': limit, 'total': total, 'totalPages': (total + limit - 1) // limit},
    }


def get_user(db, user_id):
    user = db.query(User).filter(User.id == user_id, User.deletedAt.is_(None)).first()
    if not user:
        raise AppError.not_found('User not found')
    return user


def create_user(db, data, actor_id):
    existing = db.query(User).filter(User.email == data['email']).first()
    if existing:
        raise AppError.conflict('Email is already registered')

    user = User(
        name=data['name'],
        email=data['email'],
        passwordHash=security.hash_password(data['password']),
        status=Const.USER_ACTIVE,
    )
    db.add(user)
    db.flush()

    role_ids = data.get('roleIds') or []
    for role_id in role_ids:
        db.add(UserRole(userId=user.id, roleId=role_id))

    write_audit(db, actor_id, 'USER_CREATED', 'user', 'user', user.id,
                new={'name': user.name, 'email': user.email, 'roleIds': role_ids})
    db.commit()
    db.refresh(user)
    return user


def update_user(db, user_id, data):
    user = db.query(User).filter(User.id == user_id, User.deletedAt.is_(None)).first()
    if not user:
        raise AppError.not_found('User not found')
    for key, value in data.items():
        if value is not None or key in ('avatar', 'bio'):
            setattr(user, key, value)
    db.commit()
    db.refresh(user)
    return user


def update_user_status(db, user_id, status, actor_id):
    user = db.query(User).filter(User.id == user_id, User.deletedAt.is_(None)).first()
    if not user:
        raise AppError.not_found('User not found')

    old_status = user.status
    user.status = status
    write_audit(db, actor_id, 'USER_STATUS_UPDATED', 'user', 'user', user_id,
                old={'status': old_status}, new={'status': status})
    db.commit()
    db.refresh(user)
    return user


def update_user_roles(db, user_id, role_ids, actor_id):
    user = db.query(User).filter(User.id == user_id, User.deletedAt.is_(None)).first()
    if not user:
        raise AppError.not_found('User not found')

    roles = db.query(Role).filter(Role.id.in_(role_ids)).all()
    if len(roles) != len(role_ids):
        raise AppError.bad_request('One or more roles do not exist')

    db.query(UserRole).filter(UserRole.userId == user_id).delete(synchronize_session=False)
    for role_id in role_ids:
        db.add(UserRole(userId=user_id, roleId=role_id))

    write_audit(db, actor_id, 'USER_ROLES_UPDATED', 'user', 'user', user_id, new={'roleIds': role_ids})
    db.commit()
    return get_user(db, user_id)


def delete_user(db, user_id, actor_id):
    user = db.query(User).filter(User.id == user_id, User.deletedAt.is_(None)).first()
    if not user:
        raise AppError.not_found('User not found')

    db.query(UserRole).filter(UserRole.userId == user_id).delete(synchronize_session=False)
    db.delete(user)
    write_audit(db, actor_id, 'USER_DELETED', 'user', 'user', user_id,
                old={'name': user.name, 'email': user.email})
    db.commit()