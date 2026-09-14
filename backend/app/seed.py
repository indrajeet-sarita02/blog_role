import os
import sys

sys.path.insert(0, os.getcwd())

from app.config import SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD
from app.core.security import hash_password
from app.database import Base, SessionLocal, engine
from app.models import Permission, Role, RolePermission, User, UserRole

PERMISSIONS = [
    {'name': 'Create Blog', 'slug': 'blog.create', 'module': 'blog'},
    {'name': 'View Blog', 'slug': 'blog.view', 'module': 'blog'},
    {'name': 'View All Blogs', 'slug': 'blog.viewAny', 'module': 'blog'},
    {'name': 'Update Blog', 'slug': 'blog.update', 'module': 'blog'},
    {'name': 'Update Any Blog', 'slug': 'blog.updateAny', 'module': 'blog'},
    {'name': 'Delete Blog', 'slug': 'blog.delete', 'module': 'blog'},
    {'name': 'Delete Any Blog', 'slug': 'blog.deleteAny', 'module': 'blog'},
    {'name': 'Publish Blog', 'slug': 'blog.publish', 'module': 'blog'},
    {'name': 'Approve Blog', 'slug': 'blog.approve', 'module': 'blog'},
    {'name': 'Reject Blog', 'slug': 'blog.reject', 'module': 'blog'},
    {'name': 'Archive Blog', 'slug': 'blog.archive', 'module': 'blog'},

    {'name': 'Create Comment', 'slug': 'comment.create', 'module': 'comment'},
    {'name': 'View Comment', 'slug': 'comment.view', 'module': 'comment'},
    {'name': 'View All Comments', 'slug': 'comment.viewAny', 'module': 'comment'},
    {'name': 'Update Comment', 'slug': 'comment.update', 'module': 'comment'},
    {'name': 'Update Any Comment', 'slug': 'comment.updateAny', 'module': 'comment'},
    {'name': 'Delete Comment', 'slug': 'comment.delete', 'module': 'comment'},
    {'name': 'Delete Any Comment', 'slug': 'comment.deleteAny', 'module': 'comment'},
    {'name': 'Approve Comment', 'slug': 'comment.approve', 'module': 'comment'},
    {'name': 'Reject Comment', 'slug': 'comment.reject', 'module': 'comment'},

    {'name': 'Create User', 'slug': 'user.create', 'module': 'user'},
    {'name': 'View User', 'slug': 'user.view', 'module': 'user'},
    {'name': 'Update User', 'slug': 'user.update', 'module': 'user'},
    {'name': 'Delete User', 'slug': 'user.delete', 'module': 'user'},
    {'name': 'Activate User', 'slug': 'user.activate', 'module': 'user'},
    {'name': 'Deactivate User', 'slug': 'user.deactivate', 'module': 'user'},

    {'name': 'Create Role', 'slug': 'role.create', 'module': 'role'},
    {'name': 'View Role', 'slug': 'role.view', 'module': 'role'},
    {'name': 'Update Role', 'slug': 'role.update', 'module': 'role'},
    {'name': 'Delete Role', 'slug': 'role.delete', 'module': 'role'},
    {'name': 'Assign Permission', 'slug': 'role.assignPermission', 'module': 'role'},

    {'name': 'View Permission', 'slug': 'permission.view', 'module': 'permission'},

    {'name': 'Create Category', 'slug': 'category.create', 'module': 'category'},
    {'name': 'View Category', 'slug': 'category.view', 'module': 'category'},
    {'name': 'Update Category', 'slug': 'category.update', 'module': 'category'},
    {'name': 'Delete Category', 'slug': 'category.delete', 'module': 'category'},

    {'name': 'Create Tag', 'slug': 'tag.create', 'module': 'tag'},
    {'name': 'View Tag', 'slug': 'tag.view', 'module': 'tag'},
    {'name': 'Update Tag', 'slug': 'tag.update', 'module': 'tag'},
    {'name': 'Delete Tag', 'slug': 'tag.delete', 'module': 'tag'},

    {'name': 'Upload Media', 'slug': 'media.upload', 'module': 'media'},
    {'name': 'View Media', 'slug': 'media.view', 'module': 'media'},
    {'name': 'Delete Media', 'slug': 'media.delete', 'module': 'media'},

    {'name': 'View Audit', 'slug': 'audit.view', 'module': 'audit'},
    {'name': 'View Settings', 'slug': 'settings.view', 'module': 'settings'},
    {'name': 'Update Settings', 'slug': 'settings.update', 'module': 'settings'},
]

ALL_SLUGS = [p['slug'] for p in PERMISSIONS]

ROLE_DEFINITIONS = {
    'super-admin': {
        'name': 'Super Admin',
        'description': 'Complete system access',
        'permissions': ALL_SLUGS,
    },
    'admin': {
        'name': 'Admin',
        'description': 'Administrative and content management access',
        'permissions': [s for s in ALL_SLUGS if not s.startswith('role.')],
    },
    'editor': {
        'name': 'Editor',
        'description': 'Can manage and approve content',
        'permissions': [
            'blog.create', 'blog.view', 'blog.update', 'blog.updateAny',
            'blog.delete', 'blog.deleteAny', 'blog.publish', 'blog.approve',
            'blog.reject', 'blog.archive',
            'comment.create', 'comment.view', 'comment.viewAny', 'comment.update',
            'comment.updateAny', 'comment.delete', 'comment.deleteAny', 'comment.approve',
            'comment.reject',
            'category.create', 'category.view', 'category.update', 'category.delete',
            'tag.create', 'tag.view', 'tag.update', 'tag.delete',
            'media.upload', 'media.view', 'media.delete',
        ],
    },
    'author': {
        'name': 'Author',
        'description': 'Can create and manage own posts',
        'permissions': [
            'blog.create', 'blog.view', 'blog.update', 'blog.delete', 'blog.publish',
            'comment.create', 'comment.view', 'comment.update', 'comment.delete',
            'media.upload', 'media.view',
        ],
    },
    'contributor': {
        'name': 'Contributor',
        'description': 'Can create posts and submit them for review',
        'permissions': [
            'blog.create', 'blog.view', 'blog.update', 'blog.delete',
            'comment.create', 'comment.view', 'comment.update', 'comment.delete',
        ],
    },
    'user': {
        'name': 'User',
        'description': 'Can read, comment, reply, and manage own comments',
        'permissions': [
            'blog.view',
            'comment.create', 'comment.view', 'comment.update', 'comment.delete',
        ],
    },
}


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        perm_map = {}
        for p in PERMISSIONS:
            existing = db.query(Permission).filter(Permission.slug == p['slug']).first()
            if not existing:
                existing = Permission(**p)
                db.add(existing)
                db.flush()
            perm_map[p['slug']] = existing
        db.commit()
        print('Seeded {} permissions'.format(len(PERMISSIONS)))

        role_map = {}
        for slug, defn in ROLE_DEFINITIONS.items():
            existing = db.query(Role).filter(Role.slug == slug).first()
            if not existing:
                existing = Role(name=defn['name'], slug=slug, description=defn['description'], isSystem=True)
                db.add(existing)
                db.flush()
            role_map[slug] = existing
            db.query(RolePermission).filter(RolePermission.roleId == existing.id).delete()
            for p_slug in defn['permissions']:
                db.add(RolePermission(roleId=existing.id, permissionId=perm_map[p_slug].id))
            db.commit()
        print('Seeded {} roles'.format(len(ROLE_DEFINITIONS)))

        if SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD:
            admin = db.query(User).filter(User.email == SUPER_ADMIN_EMAIL).first()
            if not admin:
                admin = User(
                    name='Super Admin',
                    email=SUPER_ADMIN_EMAIL,
                    passwordHash=hash_password(SUPER_ADMIN_PASSWORD),
                    status='active',
                )
                db.add(admin)
                db.flush()
            existing_assignment = db.query(UserRole).filter(
                UserRole.userId == admin.id, UserRole.roleId == role_map['super-admin'].id,
            ).first()
            if not existing_assignment:
                db.add(UserRole(userId=admin.id, roleId=role_map['super-admin'].id))
            db.commit()
            print('Super admin ensured: {}'.format(SUPER_ADMIN_EMAIL))
        else:
            print('SUPER_ADMIN_EMAIL/PASSWORD not set - skipping super admin creation')

        print('Seed complete')
    finally:
        db.close()


if __name__ == '__main__':
    seed()