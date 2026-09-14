from datetime import datetime

from app.config import Const
from app.core.audit import write_audit
from app.core.errors import AppError
from app.core.pagination import order_by_clause, parse_pagination
from app.core.permissions import resolve_user_permissions
from app.models import Comment, Notification, Post


def get_comment(db, comment_id):
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not comment:
        raise AppError.not_found('Comment not found')
    return comment


def create_comment(db, post_id, actor_id, content, parent_id=None):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise AppError.not_found('Post not found')

    if parent_id:
        parent = db.query(Comment).filter(Comment.id == parent_id).first()
        if not parent:
            raise AppError.bad_request('Parent comment does not exist')
        if parent.postId != post_id:
            raise AppError.bad_request('Parent comment belongs to a different post')

    comment = Comment(
        postId=post_id,
        userId=actor_id,
        parentId=parent_id,
        content=content,
        status=Const.COMMENT_PENDING,
    )
    db.add(comment)
    db.flush()

    write_audit(db, actor_id, 'COMMENT_CREATED', 'comment', 'comment', comment.id,
                new={'postId': post_id, 'parentId': parent_id})

    if post.authorId != actor_id:
        db.add(Notification(
            userId=post.authorId,
            type='comment',
            title='New comment on your post',
            message='A new comment was posted on "{}"'.format(post.title),
            data={'postId': post_id, 'commentId': comment.id},
        ))

    db.commit()
    return get_comment(db, comment.id)


def list_comments_by_post(db, post_id, actor_id, filters):
    page, limit, offset, sort, order = parse_pagination(filters)
    actor = resolve_user_permissions(db, actor_id)
    can_view_any = 'comment.viewAny' in actor['permissions']

    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise AppError.not_found('Post not found')

    q = db.query(Comment).filter(Comment.postId == post_id)
    if can_view_any:
        if filters.get('status'):
            q = q.filter(Comment.status == filters['status'])
    else:
        q = q.filter(db.or_(Comment.status == Const.COMMENT_APPROVED, Comment.userId == actor_id))

    total = q.count()
    comments = q.order_by(order_by_clause(Comment, sort, order)).offset(offset).limit(limit).all()

    return {
        'items': comments,
        'meta': {'page': page, 'limit': limit, 'total': total, 'totalPages': (total + limit - 1) // limit},
    }


def list_all_comments(db, actor_id, filters):
    page, limit, offset, sort, order = parse_pagination(filters)
    actor = resolve_user_permissions(db, actor_id)
    can_view_any = 'comment.viewAny' in actor['permissions']

    q = db.query(Comment)
    if can_view_any:
        if filters.get('status'):
            q = q.filter(Comment.status == filters['status'])
    else:
        q = q.filter(db.or_(Comment.status == Const.COMMENT_APPROVED, Comment.userId == actor_id))
    if filters.get('search'):
        q = q.filter(Comment.content.like('%{}%'.format(filters['search'])))

    total = q.count()
    comments = q.order_by(order_by_clause(Comment, sort, order)).offset(offset).limit(limit).all()

    return {
        'items': comments,
        'meta': {'page': page, 'limit': limit, 'total': total, 'totalPages': (total + limit - 1) // limit},
    }


def update_comment(db, comment_id, actor_id, content):
    comment = get_comment(db, comment_id)
    actor = resolve_user_permissions(db, actor_id)

    owns_comment = comment.userId == actor_id
    can_update_any = 'comment.updateAny' in actor['permissions']
    can_update_own = 'comment.update' in actor['permissions'] and owns_comment
    if not can_update_any and not can_update_own:
        raise AppError.forbidden()

    comment.content = content
    write_audit(db, actor_id, 'COMMENT_UPDATED', 'comment', 'comment', comment_id, new={'content': content})
    db.commit()
    return get_comment(db, comment_id)


def delete_comment(db, comment_id, actor_id):
    comment = get_comment(db, comment_id)
    actor = resolve_user_permissions(db, actor_id)

    owns_comment = comment.userId == actor_id
    can_delete_any = 'comment.deleteAny' in actor['permissions']
    can_delete_own = 'comment.delete' in actor['permissions'] and owns_comment
    if not can_delete_any and not can_delete_own:
        raise AppError.forbidden()

    comment.deletedAt = datetime.utcnow()
    write_audit(db, actor_id, 'COMMENT_DELETED', 'comment', 'comment', comment_id,
                old={'content': comment.content})
    db.commit()


def moderate_comment(db, comment_id, actor_id, target_status, permission):
    comment = get_comment(db, comment_id)
    actor = resolve_user_permissions(db, actor_id)
    if permission not in actor['permissions']:
        raise AppError.forbidden()

    old_status = comment.status
    comment.status = target_status
    write_audit(
        db, actor_id,
        'COMMENT_APPROVED' if target_status == Const.COMMENT_APPROVED else 'COMMENT_REJECTED',
        'comment', 'comment', comment_id,
        old={'status': old_status}, new={'status': target_status},
    )
    db.commit()
    return get_comment(db, comment_id)