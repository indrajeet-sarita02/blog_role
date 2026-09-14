from typing import Optional

from fastapi import APIRouter, Depends, Path, Query, Request

from app.core import responses
from app.core.context import capture
from app.deps import get_db
from app.schemas import CategoryFull, PostData, TagData
from app.services import public_service

router = APIRouter()


def _query(page, limit, search, category, tag, sort, order):
    return {
        'page': page,
        'limit': limit,
        'search': search,
        'category': category,
        'tag': tag,
        'sort': sort,
        'order': order,
    }


@router.get('/posts', status_code=200)
def list_posts(
    request: Request,
    db=Depends(get_db),
    page: Optional[str] = Query(None),
    limit: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    tag: Optional[str] = Query(None),
    sort: Optional[str] = Query(None),
    order: Optional[str] = Query(None),
):
    capture(request)
    result = public_service.list_public_posts(db, _query(page, limit, search, category, tag, sort, order))
    return responses.list_response(responses.os(result['items'], PostData), result['meta'], 'Posts retrieved')


@router.get('/posts/{slug}', status_code=200)
def get_post(request: Request, db=Depends(get_db), slug: str = Path(..., min_length=1, max_length=255)):
    capture(request)
    post = public_service.get_public_post_by_slug(db, slug)
    return responses.ok(responses.o(post, PostData), 'Post retrieved')


@router.get('/categories', status_code=200)
def list_categories(
    request: Request,
    db=Depends(get_db),
    page: Optional[str] = Query(None),
    limit: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    sort: Optional[str] = Query(None),
    order: Optional[str] = Query(None),
):
    capture(request)
    result = public_service.list_public_categories(db, _query(page, limit, search, None, None, sort, order))
    return responses.list_response(
        responses.os(result['items'], CategoryFull), result['meta'], 'Categories retrieved',
    )


@router.get('/categories/{slug}', status_code=200)
def get_category(request: Request, db=Depends(get_db), slug: str = Path(..., min_length=1, max_length=255)):
    capture(request)
    category = public_service.get_public_category_by_slug(db, slug)
    return responses.ok(responses.o(category, CategoryFull), 'Category retrieved')


@router.get('/tags', status_code=200)
def list_tags(
    request: Request,
    db=Depends(get_db),
    page: Optional[str] = Query(None),
    limit: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    sort: Optional[str] = Query(None),
    order: Optional[str] = Query(None),
):
    capture(request)
    result = public_service.list_public_tags(db, _query(page, limit, search, None, None, sort, order))
    return responses.list_response(responses.os(result['items'], TagData), result['meta'], 'Tags retrieved')


@router.get('/tags/{slug}', status_code=200)
def get_tag(request: Request, db=Depends(get_db), slug: str = Path(..., min_length=1, max_length=255)):
    capture(request)
    tag = public_service.get_public_tag_by_slug(db, slug)
    return responses.ok(responses.o(tag, TagData), 'Tag retrieved')


@router.get('/search', status_code=200)
def search(
    request: Request,
    db=Depends(get_db),
    q: str = Query(..., min_length=1, max_length=255),
    page: Optional[str] = Query(None),
    limit: Optional[str] = Query(None),
):
    capture(request)
    result = public_service.search_public(db, q, {'page': page, 'limit': limit})
    return responses.list_response(responses.os(result['items'], PostData), result['meta'], 'Search results')