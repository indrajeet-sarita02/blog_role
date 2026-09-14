from datetime import datetime

from app.config import Const
from app.core.audit import write_audit
from app.core.errors import AppError
from app.core.pagination import order_by_clause, parse_pagination
from app.core.permissions import resolve_user_permissions
from app.core.sanitize import sanitize_content
from app.core.slug import slugify
from app.models import Category, Post, PostRevision, PostTag, Tag


def _base_posts_query(db):
    return db.query(Post).filter(Post.deletedAt.is_(None))


def get_privileged_post(db, post_id):
    post = _base_posts_query(db).filter(Post.id == post_id).first()
    if not post:
        raise AppError.not_found('Post not found')
    return post


def list_posts(db, filters, actor_id):
    page, limit, offset, sort, order = parse_pagination(filters)
    actor = resolve_user_permissions(db, actor_id)
    can_view_any = 'blog.viewAny' in actor['permissions']

    q = _base_posts_query(db)
    if filters.get('categoryId'):
        q = q.filter(Post.categoryId == int(filters['categoryId']))
    if filters.get('authorId'):
        q = q.filter(Post.authorId == int(filters['authorId']))
    if filters.get('search'):
        term = '%{}%'.format(filters['search'])
        q = q.filter(db.or_(Post.title.like(term), Post.slug.like(term)))

    if can_view_any:
        if filters.get('status'):
            q = q.filter(Post.status == filters['status'])
    else:
        q = q.filter(
            db.or_(
                db.and_(Post.status == Const.POST_PUBLISHED, Post.visibility == Const.POST_VISIBILITY_PUBLIC),
                Post.authorId == actor_id,
            )
        )

    total = q.count()
    posts = q.order_by(order_by_clause(Post, sort, order)).offset(offset).limit(limit).all()

    return {
        'items': posts,
        'meta': {'page': page, 'limit': limit, 'total': total, 'totalPages': (total + limit - 1) // limit},
    }


def get_post(db, post_id, actor_id):
    post = get_privileged_post(db, post_id)
    actor = resolve_user_permissions(db, actor_id)
    can_view_any = 'blog.viewAny' in actor['permissions']

    is_visible = (
        (post.status == Const.POST_PUBLISHED and post.visibility == Const.POST_VISIBILITY_PUBLIC)
        or can_view_any
        or post.authorId == actor_id
    )
    if not is_visible:
        raise AppError.forbidden('You do not have permission to view this post')
    return post


def _ensure_unique_slug(db, slug, exclude_id=None):
    q = _base_posts_query(db).filter(Post.slug == slug)
    if exclude_id:
        q = q.filter(Post.id != exclude_id)
    if q.first():
        raise AppError.conflict('Post with this slug already exists')


def _create_revision(db, post, user_id):
    last = (
        db.query(PostRevision)
        .filter(PostRevision.postId == post.id)
        .order_by(PostRevision.revisionNumber.desc())
        .first()
    )
    revision_number = last.revisionNumber + 1 if last else 1
    db.add(PostRevision(
        postId=post.id,
        userId=user_id,
        title=post.title,
        excerpt=post.excerpt,
        content=post.content,
        featuredImage=post.featuredImage,
        revisionNumber=revision_number,
    ))


def _sync_tags(db, post_id, tag_ids=None):
    db.query(PostTag).filter(PostTag.postId == post_id).delete(synchronize_session=False)
    for tag_id in (tag_ids or []):
        db.add(PostTag(postId=post_id, tagId=tag_id))


def create_post(db, data, actor_id):
    actor = resolve_user_permissions(db, actor_id)
    if 'blog.create' not in actor['permissions']:
        raise AppError.forbidden()

    slug = data.get('slug') or slugify(data.get('title') or '')
    _ensure_unique_slug(db, slug)

    if data.get('categoryId'):
        if not db.query(Category).filter(Category.id == data['categoryId']).first():
            raise AppError.bad_request('Category does not exist')

    tag_ids = data.get('tagIds') or []
    if tag_ids:
        count = db.query(Tag).filter(Tag.id.in_(tag_ids)).count()
        if count != len(tag_ids):
            raise AppError.bad_request('One or more tags do not exist')

    status = data.get('status') or Const.POST_DRAFT

    post = Post(
        authorId=actor_id,
        title=data['title'],
        slug=slug,
        excerpt=data.get('excerpt'),
        content=sanitize_content(data['content']) if data.get('content') else data.get('content'),
        featuredImage=data.get('featuredImage'),
        categoryId=data.get('categoryId'),
        status=status,
        visibility=data.get('visibility') or Const.POST_VISIBILITY_PUBLIC,
    )
    db.add(post)
    db.flush()

    _sync_tags(db, post.id, tag_ids)

    if status == Const.POST_PENDING_REVIEW:
        _create_revision(db, post, actor_id)

    write_audit(db, actor_id, 'POST_CREATED', 'post', 'post', post.id,
                new={'title': post.title, 'slug': slug, 'status': status})
    db.commit()
    db.refresh(post)
    return post


def update_post(db, post_id, data, actor_id):
    post = get_privileged_post(db, post_id)
    actor = resolve_user_permissions(db, actor_id)

    owns_post = post.authorId == actor_id
    can_update_any = 'blog.updateAny' in actor['permissions']
    can_update_own = 'blog.update' in actor['permissions'] and owns_post
    if not can_update_any and not can_update_own:
        raise AppError.forbidden()

    old_values = {
        'title': post.title,
        'excerpt': post.excerpt,
        'content': post.content,
        'featuredImage': post.featuredImage,
        'visibility': post.visibility,
    }

    if data.get('slug') or data.get('title'):
        new_slug = data.get('slug') or slugify(data.get('title') or post.title)
        _ensure_unique_slug(db, new_slug, post_id)
        post.slug = new_slug

    if 'title' in data and data['title']:
        post.title = data['title']
    if 'excerpt' in data:
        post.excerpt = data['excerpt']
    if 'content' in data:
        post.content = sanitize_content(data['content']) if data['content'] else data['content']
    if 'featuredImage' in data:
        post.featuredImage = data['featuredImage']
    if data.get('visibility'):
        post.visibility = data['visibility']

    if 'categoryId' in data:
        category_id = data['categoryId']
        if category_id is not None:
            if not db.query(Category).filter(Category.id == category_id).first():
                raise AppError.bad_request('Category does not exist')
        post.categoryId = category_id

    _sync_tags(db, post.id, data.get('tagIds'))
    _create_revision(db, post, actor_id)

    write_audit(
        db, actor_id, 'POST_UPDATED', 'post', 'post', post_id,
        old=old_values,
        new={
            'title': post.title,
            'excerpt': post.excerpt,
            'content': post.content,
            'featuredImage': post.featuredImage,
            'visibility': post.visibility,
        },
    )
    db.commit()
    db.refresh(post)
    return post


def delete_post(db, post_id, actor_id):
    post = get_privileged_post(db, post_id)
    actor = resolve_user_permissions(db, actor_id)

    owns_post = post.authorId == actor_id
    can_delete_any = 'blog.deleteAny' in actor['permissions']
    can_delete_own = 'blog.delete' in actor['permissions'] and owns_post
    if not can_delete_any and not can_delete_own:
        raise AppError.forbidden()

    db.query(PostTag).filter(PostTag.postId == post_id).delete(synchronize_session=False)
    post.deletedAt = datetime.utcnow()
    write_audit(db, actor_id, 'POST_DELETED', 'post', 'post', post_id,
                old={'title': post.title, 'slug': post.slug})
    db.commit()


def change_post_status(db, post_id, actor_id, target_status, permission):
    post = get_privileged_post(db, post_id)
    actor = resolve_user_permissions(db, actor_id)
    if permission not in actor['permissions']:
        raise AppError.forbidden()

    old_status = post.status
    post.status = target_status
    if target_status == Const.POST_PUBLISHED:
        post.publishedAt = datetime.utcnow()

    write_audit(
        db, actor_id,
        'POST_PUBLISHED' if target_status == Const.POST_PUBLISHED else 'POST_{}'.format(target_status.upper()),
        'post', 'post', post_id,
        old={'status': old_status}, new={'status': target_status},
    )
    db.commit()
    db.refresh(post)
    return post


def submit_for_review(db, post_id, actor_id):
    post = get_privileged_post(db, post_id)
    actor = resolve_user_permissions(db, actor_id)

    owns_post = post.authorId == actor_id
    can_update_any = 'blog.updateAny' in actor['permissions']
    can_update_own = 'blog.update' in actor['permissions'] and owns_post
    if not can_update_any and not can_update_own:
        raise AppError.forbidden()

    post.status = Const.POST_PENDING_REVIEW
    _create_revision(db, post, actor_id)
    write_audit(db, actor_id, 'POST_SUBMITTED_FOR_REVIEW', 'post', 'post', post_id,
                new={'status': Const.POST_PENDING_REVIEW})
    db.commit()
    db.refresh(post)
    return post


def list_revisions(db, post_id, actor_id):
    get_post(db, post_id, actor_id)
    return (
        db.query(PostRevision)
        .filter(PostRevision.postId == post_id)
        .order_by(PostRevision.revisionNumber.desc())
        .all()
    )


def get_revision(db, post_id, revision_id, actor_id):
    get_post(db, post_id, actor_id)
    revision = (
        db.query(PostRevision)
        .filter(PostRevision.postId == post_id, PostRevision.id == revision_id)
        .first()
    )
    if not revision:
        raise AppError.not_found('Revision not found')
    return revision


def restore_revision(db, post_id, revision_id, actor_id):
    post = get_privileged_post(db, post_id)
    actor = resolve_user_permissions(db, actor_id)

    owns_post = post.authorId == actor_id
    can_update_any = 'blog.updateAny' in actor['permissions']
    can_update_own = 'blog.update' in actor['permissions'] and owns_post
    if not can_update_any and not can_update_own:
        raise AppError.forbidden()

    revision = (
        db.query(PostRevision)
        .filter(PostRevision.postId == post_id, PostRevision.id == revision_id)
        .first()
    )
    if not revision:
        raise AppError.not_found('Revision not found')

    post.title = revision.title
    post.excerpt = revision.excerpt
    post.content = revision.content
    post.featuredImage = revision.featuredImage
    _create_revision(db, post, actor_id)
    write_audit(db, actor_id, 'POST_REVISION_RESTORED', 'post', 'post', post_id,
                new={'revisionId': revision.id, 'revisionNumber': revision.revisionNumber})
    db.commit()
    db.refresh(post)
    return post