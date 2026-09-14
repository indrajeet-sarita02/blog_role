import os
import uuid
from datetime import datetime

from app.config import MAX_UPLOAD_SIZE, UPLOAD_DIR
from app.core.audit import write_audit
from app.core.errors import AppError
from app.core.pagination import order_by_clause, parse_pagination
from app.models import Media

ALLOWED_EXTENSIONS = {
    '.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg',
    '.pdf', '.doc', '.docx', '.txt', '.mp4', '.webm',
}

PUBLIC_BASE = '/uploads'


def _ensure_upload_dir():
    directory = os.path.join(os.getcwd(), UPLOAD_DIR)
    if not os.path.exists(directory):
        os.makedirs(directory, exist_ok=True)
    return directory


def _extension(filename):
    return os.path.splitext(filename or '')[1].lower()


def list_media(db, filters):
    page, limit, offset, sort, order = parse_pagination(filters)

    q = db.query(Media).filter(Media.deletedAt.is_(None))
    if filters.get('search'):
        q = q.filter(Media.originalName.like('%{}%'.format(filters['search'])))
    if filters.get('mimeType'):
        q = q.filter(Media.mimeType.like('{}%'.format(filters['mimeType'])))

    total = q.count()
    media = q.order_by(order_by_clause(Media, sort, order)).offset(offset).limit(limit).all()

    return {
        'items': media,
        'meta': {'page': page, 'limit': limit, 'total': total, 'totalPages': (total + limit - 1) // limit},
    }


def get_media(db, media_id):
    media = db.query(Media).filter(Media.id == media_id, Media.deletedAt.is_(None)).first()
    if not media:
        raise AppError.not_found('Media not found')
    return media


def save_upload(db, actor_id, upload_file, alt_text=None):
    if upload_file is None:
        raise AppError.bad_request('No file uploaded')

    original_name = upload_file.filename or 'file'
    ext = _extension(original_name)
    if ext not in ALLOWED_EXTENSIONS:
        raise AppError.bad_request('File type not allowed: {}'.format(ext or 'unknown'))

    content = upload_file.file.read(MAX_UPLOAD_SIZE + 1)
    if len(content) > MAX_UPLOAD_SIZE:
        raise AppError.bad_request('File exceeds the maximum allowed size')

    directory = _ensure_upload_dir()
    filename = '{}{}'.format(uuid.uuid4().hex, ext)
    with open(os.path.join(directory, filename), 'wb') as f:
        f.write(content)

    url = '{}/{}'.format(PUBLIC_BASE, filename)

    media = Media(
        userId=actor_id,
        fileName=filename,
        originalName=original_name,
        mimeType=upload_file.content_type or 'application/octet-stream',
        fileSize=len(content),
        storagePath=os.path.join(UPLOAD_DIR, filename),
        url=url,
        altText=alt_text,
    )
    db.add(media)
    db.flush()

    write_audit(
        db, actor_id, 'MEDIA_UPLOADED', 'media', 'media', media.id,
        new={'originalName': original_name, 'mimeType': media.mimeType, 'fileSize': media.fileSize, 'url': url},
    )
    db.commit()
    return get_media(db, media.id)


def update_media(db, media_id, actor_id, data):
    media = db.query(Media).filter(Media.id == media_id, Media.deletedAt.is_(None)).first()
    if not media:
        raise AppError.not_found('Media not found')
    if media.userId != actor_id:
        raise AppError.forbidden()
    if 'altText' in data:
        media.altText = data['altText']
    db.commit()
    return get_media(db, media_id)


def delete_media(db, media_id, actor_id):
    media = db.query(Media).filter(Media.id == media_id, Media.deletedAt.is_(None)).first()
    if not media:
        raise AppError.not_found('Media not found')

    absolute_path = os.path.join(os.getcwd(), UPLOAD_DIR, media.fileName)
    try:
        if os.path.isfile(absolute_path):
            os.unlink(absolute_path)
    except OSError:
        pass

    media.deletedAt = datetime.utcnow()
    write_audit(db, actor_id, 'MEDIA_DELETED', 'media', 'media', media_id,
                old={'originalName': media.originalName, 'url': media.url})
    db.commit()