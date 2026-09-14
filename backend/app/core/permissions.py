from app.models import Permission, Role, User


def resolve_user_permissions(db, user_id):
    user = db.query(User).filter(User.id == user_id, User.deletedAt.is_(None)).first()
    if not user:
        return {'userId': user_id, 'roles': [], 'permissions': set()}

    role_slugs = []
    permissions = set()
    for role in user.roles:
        role_slugs.append(role.slug)
        perms = db.query(Permission).join(Permission.roles).filter(Role.id == role.id).all()
        for permission in perms:
            permissions.add(permission.slug)

    return {'userId': user_id, 'roles': role_slugs, 'permissions': permissions}