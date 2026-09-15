from typing import Optional

from fastapi import APIRouter, Body, Depends, Path, Query, Request
from pydantic import BaseModel

from app.core import responses
from app.core.context import capture
from app.deps import get_current_user, get_db, require_permission
from app.schemas import CommentData, CommentListData
from app.services import comment_service


class CreateCommentBody(BaseModel):
    content: str
    parentId: Optional[int] = None


class UpdateCommentBody(BaseModel):
    content: str


router = APIRouter(tags=['Post Comments'])


def _list_filters(page, limit, status, search, sort, order):
    return {'page': page, 'limit': limit, 'status': status, 'search': search, 'sort': sort, 'order': order}


@router.post('', status_code=201)
def create_comment(
    request: Request,
    db=Depends(get_db),
    user=Depends(get_current_user),
    _perm=Depends(require_permission('comment.create')),
    post_id: int = Path(..., gt=0),
    body: CreateCommentBody = Body(...),
):
    capture(request)
    comment = comment_service.create_comment(db, post_id, user.id, body.content, body.parentId)
    return responses.created(responses.o(comment, CommentData), 'Comment created successfully')


@router.get('', status_code=200)
def list_post_comments(
    request: Request,
    db=Depends(get_db),
    user=Depends(get_current_user),
    _perm=Depends(require_permission('comment.view')),
    post_id: int = Path(..., gt=0),
    page: Optional[str] = Query(None),
    limit: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    sort: Optional[str] = Query(None),
    order: Optional[str] = Query(None),
):
    capture(request)
    result = comment_service.list_comments_by_post(
        db, post_id, user.id, _list_filters(page, limit, status, None, sort, order),
    )
    return responses.list_response(
        responses.os(result['items'], CommentData), result['meta'], 'Comments retrieved',
    )