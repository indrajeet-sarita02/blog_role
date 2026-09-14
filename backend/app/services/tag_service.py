from app.core.errors import AppError
from app.core.pagination import order_by_clause, parse_pagination
from app.core.slug import slugify
from app.models import Tag


def list_tags(db, filters):
    page, limit, offset, sort, order = parse_pagination(filters)

    q = db.query(Tag)
    if filters.get('search'):
        q = q.filter(Tag.name.like('%{}%'.format(filters['search'])))

    total = q.count()
    tags = q.order_by(order_by_clause(Tag, sort, order)).offset(offset).limit(limit).all()

    return {
        'items': tags,
        'meta': {'page': page, 'limit': limit, 'total': total, 'totalPages': (total + limit - 1) // limit},
    }


def get_tag(db, tag_id):
    tag = db.query(Tag).filter(Tag.id == tag_id).first()
    if not tag:
        raise AppError.not_found('Tag not found')
    return tag


def create_tag(db, data):
    slug = data.get('slug') or slugify(data['name'])
    existing = db.query(Tag).filter(Tag.slug == slug).first()
    if existing:
        raise AppError.conflict('Tag with this slug already exists')

    tag = Tag(name=data['name'], slug=slug)
    db.add(tag)
    db.commit()
    db.refresh(tag)
    return tag


def update_tag(db, tag_id, data):
    tag = db.query(Tag).filter(Tag.id == tag_id).first()
    if not tag:
        raise AppError.not_found('Tag not found')

    if data.get('name'):
        tag.name = data['name']
        tag.slug = slugify(data['name'])
        db.commit()
        db.refresh(tag)
    return tag


def delete_tag(db, tag_id):
    tag = db.query(Tag).filter(Tag.id == tag_id).first()
    if not tag:
        raise AppError.not_found('Tag not found')
    db.delete(tag)
    db.commit()