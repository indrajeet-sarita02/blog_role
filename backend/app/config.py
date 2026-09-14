import os


def _load_dotenv():
    env_path = os.path.join(os.getcwd(), '.env')
    if not os.path.exists(env_path):
        return
    with open(env_path) as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith('#') or '=' not in line:
                continue
            key, _, value = line.partition('=')
            key = key.strip()
            value = value.strip()
            if key and not os.environ.get(key):
                os.environ[key] = value


def _parse_expiry(value):
    value = (value or '').strip().lower()
    if not value:
        return 0
    unit = value[-1]
    try:
        num = int(value[:-1])
    except ValueError:
        return int(value or 0)
    if unit == 's':
        return num
    if unit == 'm':
        return num * 60
    if unit == 'h':
        return num * 3600
    if unit == 'd':
        return num * 86400
    return num


_load_dotenv()

IS_SERVERLESS = bool(os.environ.get('VERCEL') == '1' or os.environ.get('VERCEL_ENV'))

PORT = int(os.environ.get('PORT', '5000'))
DB_STORAGE = os.environ.get('DB_STORAGE', '/tmp/database.sqlite' if IS_SERVERLESS else './database.sqlite')
NODE_ENV = os.environ.get('NODE_ENV', 'development')

JWT_ACCESS_SECRET = os.environ.get('JWT_ACCESS_SECRET', 'access_secret')
JWT_REFRESH_SECRET = os.environ.get('JWT_REFRESH_SECRET', 'refresh_secret')
JWT_ACCESS_EXPIRES_IN = os.environ.get('JWT_ACCESS_EXPIRES_IN', '15m')
JWT_REFRESH_EXPIRES_IN = os.environ.get('JWT_REFRESH_EXPIRES_IN', '7d')
JWT_ACCESS_EXPIRES_S = _parse_expiry(JWT_ACCESS_EXPIRES_IN)
JWT_REFRESH_EXPIRES_S = _parse_expiry(JWT_REFRESH_EXPIRES_IN)

SUPER_ADMIN_EMAIL = os.environ.get('SUPER_ADMIN_EMAIL')
SUPER_ADMIN_PASSWORD = os.environ.get('SUPER_ADMIN_PASSWORD')

FRONTEND_URL = os.environ.get('FRONTEND_URL', 'http://localhost:3000')

UPLOAD_DIR = os.environ.get('UPLOAD_DIR', '/tmp/uploads' if IS_SERVERLESS else 'uploads')
MAX_UPLOAD_SIZE_MB = int(os.environ.get('MAX_UPLOAD_SIZE_MB', '10'))
MAX_UPLOAD_SIZE = MAX_UPLOAD_SIZE_MB * 1024 * 1024


class Const:
    API_BASE = '/api/v1'
    MAX_LIMIT = 100
    DEFAULT_LIMIT = 20

    USER_ACTIVE = 'active'
    USER_INACTIVE = 'inactive'
    USER_SUSPENDED = 'suspended'
    USER_PENDING = 'pending'
    USER_STATUS_LIST = ['active', 'inactive', 'suspended', 'pending']

    POST_DRAFT = 'draft'
    POST_PENDING_REVIEW = 'pending_review'
    POST_APPROVED = 'approved'
    POST_PUBLISHED = 'published'
    POST_REJECTED = 'rejected'
    POST_ARCHIVED = 'archived'
    POST_STATUS_LIST = ['draft', 'pending_review', 'approved', 'published', 'rejected', 'archived']

    POST_VISIBILITY_PUBLIC = 'public'
    POST_VISIBILITY_PRIVATE = 'private'
    POST_VISIBILITY_LIST = ['public', 'private']

    COMMENT_PENDING = 'pending'
    COMMENT_APPROVED = 'approved'
    COMMENT_REJECTED = 'rejected'
    COMMENT_SPAM = 'spam'
    COMMENT_DELETED = 'deleted'
    COMMENT_STATUS_LIST = ['pending', 'approved', 'rejected', 'spam', 'deleted']