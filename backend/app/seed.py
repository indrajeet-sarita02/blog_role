import os
import sys
from datetime import datetime

sys.path.insert(0, os.getcwd())

from app.config import SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD
from app.core.security import hash_password
from app.database import Base, SessionLocal, engine
from app.models import Category, Permission, Post, PostTag, Role, RolePermission, Tag, User, UserRole

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


DEFAULT_ADMIN_EMAIL = 'admin@example.com'
DEFAULT_ADMIN_PASSWORD = 'admin123'

SAMPLE_USERS = [
    {'name': 'Alice Johnson', 'email': 'alice@example.com', 'password': 'password123', 'role': 'author'},
    {'name': 'Bob Smith', 'email': 'bob@example.com', 'password': 'password123', 'role': 'editor'},
    {'name': 'Carol White', 'email': 'carol@example.com', 'password': 'password123', 'role': 'admin'},
    {'name': 'Dave Brown', 'email': 'dave@example.com', 'password': 'password123', 'role': 'user'},
]

SAMPLE_CATEGORIES = [
    {'name': 'Technology', 'slug': 'technology', 'description': 'Software, hardware, and tech news'},
    {'name': 'Lifestyle', 'slug': 'lifestyle', 'description': 'Everyday living and personal growth'},
    {'name': 'Health', 'slug': 'health', 'description': 'Fitness, wellness, and healthy habits'},
    {'name': 'Travel', 'slug': 'travel', 'description': 'Destinations, guides, and travel tips'},
    {'name': 'Food', 'slug': 'food', 'description': 'Recipes, cooking, and food culture'},
]

SAMPLE_TAGS = [
    'fastapi', 'python', 'vercel', 'nextjs', 'react',
    'web-development', 'tutorial', 'api', 'database', 'security',
]

SAMPLE_POSTS = [
    {
        'title': 'Building a Serverless API with FastAPI on Vercel',
        'slug': 'serverless-api-fastapi-vercel',
        'excerpt': 'Learn how to deploy a FastAPI application as a serverless function on Vercel.',
        'content': (
            '<p>FastAPI is a modern, fast web framework for building APIs with Python. '
            'In this tutorial, we walk through deploying a FastAPI app on Vercel using the '
            'Python runtime and uv for dependency management.</p>'
            '<p>We cover project structure, environment variables, and the vercel.json '
            'configuration that routes all traffic to the ASGI entrypoint.</p>'
        ),
        'status': 'published',
        'category': 'technology',
        'author': 'alice@example.com',
        'tags': ['fastapi', 'python', 'vercel', 'api', 'tutorial'],
    },
    {
        'title': 'Deploying Next.js with Tailwind CSS and TypeScript',
        'slug': 'deploy-nextjs-tailwind-typescript',
        'excerpt': 'A step-by-step guide to shipping a modern Next.js blog with Tailwind.',
        'content': (
            '<p>Next.js gives you the best of server-side rendering and static generation. '
            'Combine it with Tailwind CSS and TypeScript for a delightful development experience.</p>'
            '<p>In this guide we go over app router structure, API route proxying, and CI '
            'deployment through Vercel.</p>'
        ),
        'status': 'published',
        'category': 'technology',
        'author': 'bob@example.com',
        'tags': ['nextjs', 'react', 'web-development', 'tutorial'],
    },
    {
        'title': '10 Tips for a Healthier Morning Routine',
        'slug': 'healthier-morning-routine',
        'excerpt': 'Small changes to start your day with more energy and focus.',
        'content': (
            '<p>Your morning routine sets the tone for the entire day. We share ten practical '
            'habits backed by research to improve sleep, hydration, and focus.</p>'
            '<p>Start small, be consistent, and give yourself time to adapt a routine that works '
            'for you.</p>'
        ),
        'status': 'published',
        'category': 'health',
        'author': 'carol@example.com',
        'tags': ['tutorial'],
    },
    {
        'title': 'A Weekend Guide to the Himalayas',
        'slug': 'weekend-himalayas-guide',
        'excerpt': 'Short trek itineraries, packing lists, and safety tips for the mountains.',
        'content': (
            '<p>The Himalayas offer some of the most spectacular short treks in the world. '
            'This weekend guide covers route planning, acclimatization, and essential gear.</p>'
            '<p>Always check weather conditions and hire a local guide when in doubt.</p>'
        ),
        'status': 'published',
        'category': 'travel',
        'author': 'dave@example.com',
        'tags': [],
    },
    {
        'title': "Beginner's Guide to SQLAlchemy ORM",
        'slug': 'sqlalchemy-orm-beginners-guide',
        'excerpt': 'Models, relationships, and sessions explained for newcomers.',
        'content': (
            '<p>SQLAlchemy is the most popular SQL toolkit for Python. This guide introduces '
            'declarative models, relationships, and the session lifecycle with clear examples.</p>'
            '<p>By the end, you will understand how to map your application tables to Python '
            'classes and query them safely.</p>'
        ),
        'status': 'published',
        'category': 'technology',
        'author': 'alice@example.com',
        'tags': ['python', 'database', 'tutorial'],
    },
]


def _ensure_role(db, role_map, email, role_slug, password, name):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = User(
            name=name,
            email=email,
            passwordHash=hash_password(password),
            status='active',
        )
        db.add(user)
        db.flush()
    assignment = db.query(UserRole).filter(
        UserRole.userId == user.id, UserRole.roleId == role_map[role_slug].id,
    ).first()
    if not assignment:
        db.add(UserRole(userId=user.id, roleId=role_map[role_slug].id))
    return user


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

        admin_email = SUPER_ADMIN_EMAIL or DEFAULT_ADMIN_EMAIL
        admin_password = SUPER_ADMIN_PASSWORD or DEFAULT_ADMIN_PASSWORD
        admin = db.query(User).filter(User.email == admin_email).first()
        if not admin:
            admin = User(
                name='Super Admin',
                email=admin_email,
                passwordHash=hash_password(admin_password),
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
        print('Super admin ensured: {}'.format(admin_email))

        users_by_email = {admin_email: admin}
        for sample in SAMPLE_USERS:
            sample_user = _ensure_role(
                db, role_map, sample['email'], sample['role'], sample['password'], sample['name'],
            )
            users_by_email[sample['email']] = sample_user
        db.commit()
        print('Seeded {} sample users'.format(len(SAMPLE_USERS)))

        category_map = {}
        for cat in SAMPLE_CATEGORIES:
            existing = db.query(Category).filter(Category.slug == cat['slug']).first()
            if not existing:
                existing = Category(name=cat['name'], slug=cat['slug'], description=cat['description'], status='active')
                db.add(existing)
                db.flush()
            category_map[cat['slug']] = existing
        db.commit()
        print('Seeded {} categories'.format(len(SAMPLE_CATEGORIES)))

        tag_map = {}
        for tag_name in SAMPLE_TAGS:
            existing = db.query(Tag).filter(Tag.slug == tag_name).first()
            if not existing:
                existing = Tag(name=tag_name, slug=tag_name)
                db.add(existing)
                db.flush()
            tag_map[tag_name] = existing
        db.commit()
        print('Seeded {} tags'.format(len(SAMPLE_TAGS)))

        post_count = 0
        for post_data in SAMPLE_POSTS:
            if db.query(Post).filter(Post.slug == post_data['slug']).first():
                continue
            post = Post(
                authorId=users_by_email[post_data['author']].id,
                categoryId=category_map[post_data['category']].id,
                title=post_data['title'],
                slug=post_data['slug'],
                excerpt=post_data['excerpt'],
                content=post_data['content'],
                status=post_data['status'],
                visibility='public',
                publishedAt=datetime.utcnow(),
            )
            db.add(post)
            db.flush()
            for tag_name in post_data['tags']:
                db.add(PostTag(postId=post.id, tagId=tag_map[tag_name].id))
            post_count += 1
        db.commit()
        print('Seeded {} posts'.format(post_count))

        print('Seed complete')
    finally:
        db.close()


if __name__ == '__main__':
    seed()