from app.config import Const
from app.core.errors import AppError
from app.core.pagination import order_by_clause, parse_pagination
from app.core.sanitize import sanitize_content
from app.models import Category, Post, PostTag, Tag


def db_public_condition():
    return Post.status == Const.POST_PUBLISHED, Post.visibility == Const.POST_VISIBILITY_PUBLIC


def _to_public_post(post):
    if post.content:
        post.content = sanitize_content(post.content)
    return post


def list_public_posts(db, filters):
    page, limit, offset, sort, order = parse_pagination(filters)

    q = db.query(Post).filter(Post.deletedAt.is_(None), *db_public_condition())

    if filters.get('search'):
        term = '%{}%'.format(filters['search'])
        q = q.filter(db.or_(Post.title.like(term), Post.excerpt.like(term)))

    if filters.get('category'):
        category = db.query(Category).filter(Category.slug == filters['category']).first()
        if category:
            q = q.filter(Post.categoryId == category.id)

    if filters.get('tag'):
        q = (
            q.join(PostTag, PostTag.postId == Post.id)
            .join(Tag, Tag.id == PostTag.tagId)
            .filter(Tag.slug == filters['tag'])
            .distinct()
        )

    total = q.count()
    posts = q.order_by(order_by_clause(Post, sort, order)).offset(offset).limit(limit).all()

    return {
        'items': [_to_public_post(p) for p in posts],
        'meta': {'page': page, 'limit': limit, 'total': total, 'totalPages': (total + limit - 1) // limit},
    }


def get_public_post_by_slug(db, slug):
    post = (
        db.query(Post)
        .filter(Post.slug == slug, Post.deletedAt.is_(None), *db_public_condition())
        .first()
    )
    if not post:
        raise AppError.not_found('Post not found')
    return _to_public_post(post)


def list_public_categories(db, filters):
    page, limit, offset, sort, order = parse_pagination(filters)

    q = db.query(Category).filter(Category.status == 'active')
    if filters.get('search'):
        q = q.filter(Category.name.like('%{}%'.format(filters['search'])))

    total = q.count()
    categories = q.order_by(order_by_clause(Category, sort, order)).offset(offset).limit(limit).all()

    return {
        'items': categories,
        'meta': {'page': page, 'limit': limit, 'total': total, 'totalPages': (total + limit - 1) // limit},
    }


def get_public_category_by_slug(db, slug):
    category = db.query(Category).filter(Category.slug == slug, Category.status == 'active').first()
    if not category:
        raise AppError.not_found('Category not found')
    return category


def list_public_tags(db, filters):
    page, limit, offset, sort, order = parse_pagination(filters)

    q = db.query(Tag)
    if filters.get('search'):
        q = q.filter(Tag.name.like('%{}%'.format(filters['search'])))

    total = q.count()
    tags = q.order_by(order_by_clause(Tag, sort, order)).offset(offset).limit(limit).all()

    return {
        'items': tags,
        'meta': {'page': page, 'limit': limit, 'total': total, 'totalPages': (total + limit - 1) // limit},
    }


def get_public_tag_by_slug(db, slug):
    tag = db.query(Tag).filter(Tag.slug == slug).first()
    if not tag:
        raise AppError.not_found('Tag not found')
    return tag


def search_public(db, query, filters):
    page, limit, offset = parse_pagination(filters)[:3]

    term = '%{}%'.format(query)
    q = (
        db.query(Post)
        .filter(
            Post.deletedAt.is_(None),
            Post.status == Const.POST_PUBLISHED,
            Post.visibility == Const.POST_VISIBILITY_PUBLIC,
            db.or_(Post.title.like(term), Post.excerpt.like(term), Post.content.like(term)),
        )
    )

    total = q.count()
    posts = q.order_by(Post.publishedAt.desc()).offset(offset).limit(limit).all()

    return {
        'items': [_to_public_post(p) for p in posts],
        'meta': {'page': page, 'limit': limit, 'total': total, 'totalPages': (total + limit - 1) // limit},
    }