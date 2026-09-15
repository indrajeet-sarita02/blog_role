from typing import Optional

from fastapi import APIRouter, Body, Depends, File, Form, Path, Query, Request, UploadFile
from pydantic import BaseModel

from app.core import responses
from app.core.context import capture
from app.deps import get_current_user, get_db, require_permission
from app.schemas import MediaData
from app.services import media_service

router = APIRouter(tags=['Media'])


class UpdateMediaBody(BaseModel):
    altText: Optional[str] = None


def _query(page, limit, search, mime_type, sort, order):
    return {'page': page, 'limit': limit, 'search': search, 'mimeType': mime_type, 'sort': sort, 'order': order}


@router.get('', status_code=200)
def list_media(
    request: Request,
    db=Depends(get_db),
    user=Depends(get_current_user),
    _perm=Depends(require_permission('media.view')),
    page: Optional[str] = Query(None),
    limit: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    mimeType: Optional[str] = Query(None),
    sort: Optional[str] = Query(None),
    order: Optional[str] = Query(None),
):
    capture(request)
    result = media_service.list_media(db, _query(page, limit, search, mimeType, sort, order))
    return responses.list_response(responses.os(result['items'], MediaData), result['meta'], 'Media retrieved')


@router.post('', status_code=201)
def upload_media(
    request: Request,
    db=Depends(get_db),
    user=Depends(get_current_user),
    _perm=Depends(require_permission('media.upload')),
    file: UploadFile = File(...),
    altText: Optional[str] = Form(None),
):
    capture(request)
    media = media_service.save_upload(db, user.id, file, altText)
    return responses.created(responses.o(media, MediaData), 'Media uploaded successfully')


@router.get('/{media_id}', status_code=200)
def get_media(
    request: Request,
    db=Depends(get_db),
    _perm=Depends(require_permission('media.view')),
    media_id: int = Path(..., gt=0),
):
    capture(request)
    media = media_service.get_media(db, media_id)
    return responses.ok(responses.o(media, MediaData), 'Media retrieved')


@router.put('/{media_id}', status_code=200)
def update_media(
    request: Request,
    db=Depends(get_db),
    user=Depends(get_current_user),
    _perm=Depends(require_permission('media.upload')),
    media_id: int = Path(..., gt=0),
    body: UpdateMediaBody = Body(...),
):
    capture(request)
    media = media_service.update_media(db, media_id, user.id, body.dict(exclude_unset=True))
    return responses.ok(responses.o(media, MediaData), 'Media updated successfully')


@router.delete('/{media_id}', status_code=204)
def delete_media(
    request: Request,
    db=Depends(get_db),
    user=Depends(get_current_user),
    _perm=Depends(require_permission('media.delete')),
    media_id: int = Path(..., gt=0),
):
    capture(request)
    media_service.delete_media(db, media_id, user.id)
    return responses.no_content()