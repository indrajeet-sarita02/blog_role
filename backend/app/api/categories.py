from typing import Optional

from fastapi import APIRouter, Body, Depends, Path, Query, Request
from pydantic import BaseModel

from app.core import responses
from app.core.context import capture
from app.deps import get_db, require_permission
from app.schemas import CategoryDetail, CategoryList
from app.services import category_service


class CreateCategoryBody(BaseModel):
    name: str
    slug: Optional[str] = None
    description: Optional[str] = None
    parentId: Optional[int] = None
    status: Optional[str] = None


class UpdateCategoryBody(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    parentId: Optional[int] = None
    status: Optional[str] = None


router = APIRouter(tags=['Categories'])


def _query(page, limit, search, status, sort, order):
    return {'page': page, 'limit': limit, 'search': search, 'status': status, 'sort': sort, 'order': order}


@router.get('', status_code=200)
def list_categories(
    request: Request,
    db=Depends(get_db),
    _perm=Depends(require_permission('category.view')),
    page: Optional[str] = Query(None),
    limit: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    sort: Optional[str] = Query(None),
    order: Optional[str] = Query(None),
):
    capture(request)
    result = category_service.list_categories(db, _query(page, limit, search, status, sort, order))
    return responses.list_response(
        responses.os(result['items'], CategoryList), result['meta'], 'Categories retrieved',
    )


@router.post('', status_code=201)
def create_category(
    request: Request,
    db=Depends(get_db),
    _perm=Depends(require_permission('category.create')),
    body: CreateCategoryBody = Body(...),
):
    capture(request)
    category = category_service.create_category(db, body.dict(exclude_unset=True))
    return responses.created(responses.o(category, CategoryDetail), 'Category created successfully')


@router.get('/{category_id}', status_code=200)
def get_category(
    request: Request,
    db=Depends(get_db),
    _perm=Depends(require_permission('category.view')),
    category_id: int = Path(..., gt=0),
):
    capture(request)
    category = category_service.get_category(db, category_id)
    return responses.ok(responses.o(category, CategoryDetail), 'Category retrieved')


@router.put('/{category_id}', status_code=200)
def update_category(
    request: Request,
    db=Depends(get_db),
    _perm=Depends(require_permission('category.update')),
    category_id: int = Path(..., gt=0),
    body: UpdateCategoryBody = Body(...),
):
    capture(request)
    category = category_service.update_category(db, category_id, body.dict(exclude_unset=True))
    return responses.ok(responses.o(category, CategoryDetail), 'Category updated successfully')


@router.delete('/{category_id}', status_code=204)
def delete_category(
    request: Request,
    db=Depends(get_db),
    _perm=Depends(require_permission('category.delete')),
    category_id: int = Path(..., gt=0),
):
    capture(request)
    category_service.delete_category(db, category_id)
    return responses.no_content()