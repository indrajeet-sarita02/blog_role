from typing import List, Optional

from fastapi import APIRouter, Body, Depends, Path, Query, Request
from pydantic import BaseModel

from app.config import Const
from app.core import responses
from app.core.context import capture
from app.deps import get_current_user, get_db, require_permission
from app.schemas import PostData, PostRevisionData
from app.services import post_service


class CreatePostBody(BaseModel):
    title: str
    slug: Optional[str] = None
    excerpt: Optional[str] = None
    content: Optional[str] = None
    featuredImage: Optional[str] = None
    categoryId: Optional[int] = None
    tagIds: Optional[List[int]] = None
    visibility: Optional[str] = None
    status: Optional[str] = None


class UpdatePostBody(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    excerpt: Optional[str] = None
    content: Optional[str] = None
    featuredImage: Optional[str] = None
    categoryId: Optional[int] = None
    tagIds: Optional[List[int]] = None
    visibility: Optional[str] = None


router = APIRouter()


def _filters(page, limit, search, status, category_id, author_id, sort, order):
    return {
        'page': page,
        'limit': limit,
        'search': search,
        'status': status,
        'categoryId': category_id,
        'authorId': author_id,
        'sort': sort,
        'order': order,
    }


def _reply(result, message):
    return responses.list_response(responses.os(result['items'], PostData), result['meta'], message)


def _single(post, message, status_code=200):
    data = responses.o(post, PostData)
    if status_code == 201:
        return responses.created(data, message)
    return responses.ok(data, message)


@router.get('', status_code=200)
def list_posts(
    request: Request,
    db=Depends(get_db),
    user=Depends(get_current_user),
    _perm=Depends(require_permission('blog.view')),
    page: Optional[str] = Query(None),
    limit: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    categoryId: Optional[str] = Query(None),
    authorId: Optional[str] = Query(None),
    sort: Optional[str] = Query(None),
    order: Optional[str] = Query(None),
):
    capture(request)
    result = post_service.list_posts(
        db, _filters(page, limit, search, status, categoryId, authorId, sort, order), user.id,
    )
    return _reply(result, 'Posts retrieved')


@router.post('', status_code=201)
def create_post(
    request: Request,
    db=Depends(get_db),
    user=Depends(get_current_user),
    _perm=Depends(require_permission('blog.create')),
    body: CreatePostBody = Body(...),
):
    capture(request)
    post = post_service.create_post(db, body.dict(exclude_unset=True), user.id)
    return _single(post, 'Post created successfully', 201)


@router.get('/{post_id}', status_code=200)
def get_post(
    request: Request,
    db=Depends(get_db),
    user=Depends(get_current_user),
    _perm=Depends(require_permission('blog.view')),
    post_id: int = Path(..., gt=0),
):
    capture(request)
    post = post_service.get_post(db, post_id, user.id)
    return _single(post, 'Post retrieved')


@router.put('/{post_id}', status_code=200)
def update_post(
    request: Request,
    db=Depends(get_db),
    user=Depends(get_current_user),
    _perm=Depends(require_permission('blog.update')),
    post_id: int = Path(..., gt=0),
    body: UpdatePostBody = Body(...),
):
    capture(request)
    post = post_service.update_post(db, post_id, body.dict(exclude_unset=True), user.id)
    return _single(post, 'Post updated successfully')


@router.delete('/{post_id}', status_code=204)
def delete_post(
    request: Request,
    db=Depends(get_db),
    user=Depends(get_current_user),
    _perm=Depends(require_permission('blog.delete')),
    post_id: int = Path(..., gt=0),
):
    capture(request)
    post_service.delete_post(db, post_id, user.id)
    return responses.no_content()


@router.post('/{post_id}/submit-review', status_code=200)
def submit_review(
    request: Request,
    db=Depends(get_db),
    user=Depends(get_current_user),
    _perm=Depends(require_permission('blog.update')),
    post_id: int = Path(..., gt=0),
):
    capture(request)
    post = post_service.submit_for_review(db, post_id, user.id)
    return _single(post, 'Post submitted for review')


@router.post('/{post_id}/approve', status_code=200)
def approve_post(
    request: Request,
    db=Depends(get_db),
    user=Depends(get_current_user),
    _perm=Depends(require_permission('blog.approve')),
    post_id: int = Path(..., gt=0),
):
    capture(request)
    post = post_service.change_post_status(db, post_id, user.id, Const.POST_APPROVED, 'blog.approve')
    return _single(post, 'Post approved')


@router.post('/{post_id}/reject', status_code=200)
def reject_post(
    request: Request,
    db=Depends(get_db),
    user=Depends(get_current_user),
    _perm=Depends(require_permission('blog.reject')),
    post_id: int = Path(..., gt=0),
):
    capture(request)
    post = post_service.change_post_status(db, post_id, user.id, Const.POST_REJECTED, 'blog.reject')
    return _single(post, 'Post rejected')


@router.post('/{post_id}/publish', status_code=200)
def publish_post(
    request: Request,
    db=Depends(get_db),
    user=Depends(get_current_user),
    _perm=Depends(require_permission('blog.publish')),
    post_id: int = Path(..., gt=0),
):
    capture(request)
    post = post_service.change_post_status(db, post_id, user.id, Const.POST_PUBLISHED, 'blog.publish')
    return _single(post, 'Post published')


@router.post('/{post_id}/archive', status_code=200)
def archive_post(
    request: Request,
    db=Depends(get_db),
    user=Depends(get_current_user),
    _perm=Depends(require_permission('blog.archive')),
    post_id: int = Path(..., gt=0),
):
    capture(request)
    post = post_service.change_post_status(db, post_id, user.id, Const.POST_ARCHIVED, 'blog.archive')
    return _single(post, 'Post archived')


@router.get('/{post_id}/revisions', status_code=200)
def list_revisions(
    request: Request,
    db=Depends(get_db),
    user=Depends(get_current_user),
    _perm=Depends(require_permission('blog.view')),
    post_id: int = Path(..., gt=0),
):
    capture(request)
    revisions = post_service.list_revisions(db, post_id, user.id)
    return responses.ok(responses.os(revisions, PostRevisionData), 'Revisions retrieved')


@router.get('/{post_id}/revisions/{revision_id}', status_code=200)
def get_revision(
    request: Request,
    db=Depends(get_db),
    user=Depends(get_current_user),
    _perm=Depends(require_permission('blog.view')),
    post_id: int = Path(..., gt=0),
    revision_id: int = Path(..., gt=0),
):
    capture(request)
    revision = post_service.get_revision(db, post_id, revision_id, user.id)
    return responses.ok(responses.o(revision, PostRevisionData), 'Revision retrieved')


@router.post('/{post_id}/revisions/{revision_id}/restore', status_code=200)
def restore_revision(
    request: Request,
    db=Depends(get_db),
    user=Depends(get_current_user),
    _perm=Depends(require_permission('blog.update')),
    post_id: int = Path(..., gt=0),
    revision_id: int = Path(..., gt=0),
):
    capture(request)
    post = post_service.restore_revision(db, post_id, revision_id, user.id)
    return _single(post, 'Revision restored')