from typing import Optional

from fastapi import APIRouter, Body, Depends, Path, Query, Request
from pydantic import BaseModel

from app.core import responses
from app.core.context import capture
from app.deps import get_db, require_permission
from app.schemas import TagData
from app.services import tag_service


class CreateTagBody(BaseModel):
    name: str
    slug: Optional[str] = None


class UpdateTagBody(BaseModel):
    name: Optional[str] = None


router = APIRouter()


def _query(page, limit, search, sort, order):
    return {'page': page, 'limit': limit, 'search': search, 'sort': sort, 'order': order}


@router.get('', status_code=200)
def list_tags(
    request: Request,
    db=Depends(get_db),
    _perm=Depends(require_permission('tag.view')),
    page: Optional[str] = Query(None),
    limit: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    sort: Optional[str] = Query(None),
    order: Optional[str] = Query(None),
):
    capture(request)
    result = tag_service.list_tags(db, _query(page, limit, search, sort, order))
    return responses.list_response(responses.os(result['items'], TagData), result['meta'], 'Tags retrieved')


@router.post('', status_code=201)
def create_tag(
    request: Request,
    db=Depends(get_db),
    _perm=Depends(require_permission('tag.create')),
    body: CreateTagBody = Body(...),
):
    capture(request)
    tag = tag_service.create_tag(db, body.dict(exclude_unset=True))
    return responses.created(responses.o(tag, TagData), 'Tag created successfully')


@router.get('/{tag_id}', status_code=200)
def get_tag(
    request: Request,
    db=Depends(get_db),
    _perm=Depends(require_permission('tag.view')),
    tag_id: int = Path(..., gt=0),
):
    capture(request)
    tag = tag_service.get_tag(db, tag_id)
    return responses.ok(responses.o(tag, TagData), 'Tag retrieved')


@router.put('/{tag_id}', status_code=200)
def update_tag(
    request: Request,
    db=Depends(get_db),
    _perm=Depends(require_permission('tag.update')),
    tag_id: int = Path(..., gt=0),
    body: UpdateTagBody = Body(...),
):
    capture(request)
    tag = tag_service.update_tag(db, tag_id, body.dict(exclude_unset=True))
    return responses.ok(responses.o(tag, TagData), 'Tag updated successfully')


@router.delete('/{tag_id}', status_code=204)
def delete_tag(
    request: Request,
    db=Depends(get_db),
    _perm=Depends(require_permission('tag.delete')),
    tag_id: int = Path(..., gt=0),
):
    capture(request)
    tag_service.delete_tag(db, tag_id)
    return responses.no_content()