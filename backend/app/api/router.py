from fastapi import APIRouter

from app.api import (
    audit,
    auth,
    categories,
    comments,
    media,
    notifications,
    permissions,
    post_comments,
    posts,
    public,
    roles,
    settings,
    tags,
    users,
)

api_router = APIRouter()


def _health():
    from app.core import responses
    return responses.ok({'status': 'up'}, 'OK')


api_router.add_api_route('/health', _health, methods=['GET'])

api_router.include_router(auth.router, prefix='/auth')
api_router.include_router(users.router, prefix='/users')
api_router.include_router(roles.router, prefix='/roles')
api_router.include_router(permissions.router, prefix='/permissions')
api_router.include_router(categories.router, prefix='/categories')
api_router.include_router(tags.router, prefix='/tags')
api_router.include_router(posts.router, prefix='/posts')
api_router.include_router(post_comments.router, prefix='/posts/{post_id}/comments')
api_router.include_router(comments.router, prefix='/comments')
api_router.include_router(public.router, prefix='/public')
api_router.include_router(media.router, prefix='/media')
api_router.include_router(audit.router, prefix='/audit')
api_router.include_router(notifications.router, prefix='/notifications')
api_router.include_router(settings.router, prefix='/settings')