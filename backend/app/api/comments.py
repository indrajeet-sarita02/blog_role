from typing import Optional

from fastapi import APIRouter, Body, Depends, Path, Query, Request
from pydantic import BaseModel

from app.config import Const
from app.core import responses
from app.core.context import capture
from app.deps import get_current_user, get_db, require_permission
from app.schemas import CommentData, CommentListData
from app.services import comment_service


class UpdateCommentBody(BaseModel):
    content: str


router = APIRouter(tags=['Comments'])


def _query(page, limit, status, search, sort, order):
    return {'page': page, 'limit': limit, 'status': status, 'search': search, 'sort': sort, 'order': order}


@router.get('', status_code=200)
def list_all_comments(
    request: Request,
    db=Depends(get_db),
    user=Depends(get_current_user),
    _perm=Depends(require_permission('comment.view')),
    page: Optional[str] = Query(None),
    limit: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    sort: Optional[str] = Query(None),
    order: Optional[str] = Query(None),
):
    capture(request)
    result = comment_service.list_all_comments(db, user.id, _query(page, limit, status, search, sort, order))
    return responses.list_response(
        responses.os(result['items'], CommentListData), result['meta'], 'Comments retrieved',
    )


@router.get('/{comment_id}', status_code=200)
def get_comment(
    request: Request,
    db=Depends(get_db),
    _perm=Depends(require_permission('comment.view')),
    comment_id: int = Path(..., gt=0),
):
    capture(request)
    comment = comment_service.get_comment(db, comment_id)
    return responses.ok(responses.o(comment, CommentData), 'Comment retrieved')


@router.put('/{comment_id}', status_code=200)
def update_comment(
    request: Request,
    db=Depends(get_db),
    user=Depends(get_current_user),
    _perm=Depends(require_permission('comment.update')),
    comment_id: int = Path(..., gt=0),
    body: UpdateCommentBody = Body(...),
):
    capture(request)
    comment = comment_service.update_comment(db, comment_id, user.id, body.content)
    return responses.ok(responses.o(comment, CommentData), 'Comment updated successfully')


@router.delete('/{comment_id}', status_code=204)
def delete_comment(
    request: Request,
    db=Depends(get_db),
    user=Depends(get_current_user),
    _perm=Depends(require_permission('comment.delete')),
    comment_id: int = Path(..., gt=0),
):
    capture(request)
    comment_service.delete_comment(db, comment_id, user.id)
    return responses.no_content()


@router.post('/{comment_id}/approve', status_code=200)
def approve_comment(
    request: Request,
    db=Depends(get_db),
    user=Depends(get_current_user),
    _perm=Depends(require_permission('comment.approve')),
    comment_id: int = Path(..., gt=0),
):
    capture(request)
    comment = comment_service.moderate_comment(db, comment_id, user.id, Const.COMMENT_APPROVED, 'comment.approve')
    return responses.ok(responses.o(comment, CommentData), 'Comment approved')


@router.post('/{comment_id}/reject', status_code=200)
def reject_comment(
    request: Request,
    db=Depends(get_db),
    user=Depends(get_current_user),
    _perm=Depends(require_permission('comment.reject')),
    comment_id: int = Path(..., gt=0),
):
    capture(request)
    comment = comment_service.moderate_comment(db, comment_id, user.id, Const.COMMENT_REJECTED, 'comment.reject')
    return responses.ok(responses.o(comment, CommentData), 'Comment rejected')