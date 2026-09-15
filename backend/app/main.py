import os

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from starlette.exceptions import HTTPException as StarletteHTTPException
from starlette.middleware.base import BaseHTTPMiddleware

from app.api.router import api_router
from app.config import FRONTEND_URLS, UPLOAD_DIR
from app.core.errors import AppError
from app.core.rate_limit import check_rate_limit
from app.database import init_db


class RateLimitMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        response = check_rate_limit(request)
        if response is not None:
            return response
        return await call_next(request)


def create_app():
    init_db()
    app = FastAPI(
        title='Blog API',
        description='REST API for the blog application. All endpoints are documented with '
        'Swagger UI (/docs) and ReDoc (/redoc). Interactive requests can be run directly '
        'from the Swagger UI.',
        version='1.0.0',
        docs_url='/docs',
        redoc_url='/redoc',
        openapi_url='/openapi.json',
        openapi_tags=[
            {'name': 'Auth', 'description': 'Registration, login, refresh tokens and logout'},
            {'name': 'Users', 'description': 'Manage blog users and their status'},
            {'name': 'Roles', 'description': 'Manage user roles'},
            {'name': 'Permissions', 'description': 'List and manage permissions'},
            {'name': 'Categories', 'description': 'Manage post categories'},
            {'name': 'Tags', 'description': 'Manage post tags'},
            {'name': 'Posts', 'description': 'Manage blog posts and revisions'},
            {'name': 'Post Comments', 'description': 'Create and manage comments on a specific post'},
            {'name': 'Comments', 'description': 'Moderate comments across all posts'},
            {'name': 'Public', 'description': 'Public read-only content endpoints'},
            {'name': 'Media', 'description': 'Upload and manage media files'},
            {'name': 'Audit Logs', 'description': 'Audit trail of actions'},
            {'name': 'Notifications', 'description': 'User notifications'},
            {'name': 'Settings', 'description': 'App settings'},
            {'name': 'Meta', 'description': 'Health and metadata endpoints'},
        ],
    )

    app.add_middleware(RateLimitMiddleware)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=FRONTEND_URLS,
        allow_credentials=True,
        allow_methods=['*'],
        allow_headers=['*'],
    )

    upload_dir = os.path.join(os.getcwd(), UPLOAD_DIR)
    if not os.path.isdir(upload_dir):
        try:
            os.makedirs(upload_dir, exist_ok=True)
        except OSError:
            upload_dir = os.path.join('/tmp', UPLOAD_DIR)
            os.makedirs(upload_dir, exist_ok=True)
    if os.path.isdir(upload_dir):
        app.mount('/uploads', StaticFiles(directory=upload_dir), name='uploads')

    @app.exception_handler(AppError)
    async def app_error_handler(request: Request, exc: AppError):
        return JSONResponse(
            status_code=exc.status_code,
            content={
                'success': False,
                'message': exc.message,
                'error': {'code': exc.code, 'details': exc.details},
            },
        )

    @app.exception_handler(StarletteHTTPException)
    async def http_error_handler(request: Request, exc: StarletteHTTPException):
        if exc.status_code == 404:
            return JSONResponse(
                status_code=404,
                content={
                    'success': False,
                    'message': 'Route {} not found'.format(request.url.path),
                    'error': {'code': 'NOT_FOUND', 'details': None},
                },
            )
        return JSONResponse(
            status_code=exc.status_code,
            content={
                'success': False,
                'message': str(exc.detail),
                'error': {'code': 'INTERNAL_SERVER_ERROR', 'details': None},
            },
        )

    try:
        from fastapi.exceptions import RequestValidationError

        @app.exception_handler(RequestValidationError)
        async def validation_error_handler(request: Request, exc: RequestValidationError):
            details = []
            for err in exc.errors():
                field = '.'.join(str(loc) for loc in err['loc'][1:]) if err['loc'] else ''
                details.append({'field': field, 'message': err['msg']})
            return JSONResponse(
                status_code=422,
                content={
                    'success': False,
                    'message': 'Validation failed',
                    'error': {'code': 'VALIDATION_ERROR', 'details': details},
                },
            )
    except ImportError:
        pass

    @app.exception_handler(Exception)
    async def generic_error_handler(request: Request, exc: Exception):
        print('Unhandled exception:', exc)
        return JSONResponse(
            status_code=500,
            content={
                'success': False,
                'message': 'Internal server error',
                'error': {'code': 'INTERNAL_SERVER_ERROR', 'details': None},
            },
        )

    app.include_router(api_router, prefix='/api/v1')

    return app


app = create_app()