from app.core.errors import AppError
from app.core.pagination import order_by_clause, parse_pagination
from app.core.slug import slugify
from app.models import Category


def list_categories(db, filters):
    page, limit, offset, sort, order = parse_pagination(filters)

    q = db.query(Category)
    if filters.get('status'):
        q = q.filter(Category.status == filters['status'])
    if filters.get('search'):
        q = q.filter(Category.name.like('%{}%'.format(filters['search'])))

    total = q.count()
    categories = q.order_by(order_by_clause(Category, sort, order)).offset(offset).limit(limit).all()

    return {
        'items': categories,
        'meta': {'page': page, 'limit': limit, 'total': total, 'totalPages': (total + limit - 1) // limit},
    }


def get_category(db, category_id):
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise AppError.not_found('Category not found')
    return category


def create_category(db, data):
    slug = data.get('slug') or slugify(data['name'])
    existing = db.query(Category).filter(Category.slug == slug).first()
    if existing:
        raise AppError.conflict('Category with this slug already exists')

    parent_id = data.get('parentId')
    if parent_id:
        parent = db.query(Category).filter(Category.id == parent_id).first()
        if not parent:
            raise AppError.bad_request('Parent category does not exist')

    category = Category(
        name=data['name'],
        slug=slug,
        description=data.get('description'),
        parentId=parent_id,
        status=data.get('status') or 'active',
    )
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


def update_category(db, category_id, data):
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise AppError.not_found('Category not found')

    if data.get('parentId'):
        if data['parentId'] == category_id:
            raise AppError.bad_request('A category cannot be its own parent')
        parent = db.query(Category).filter(Category.id == data['parentId']).first()
        if not parent:
            raise AppError.bad_request('Parent category does not exist')

    for key, value in data.items():
        if value is not None or key in ('description', 'parentId'):
            setattr(category, key, value)

    db.commit()
    db.refresh(category)
    return category


def delete_category(db, category_id):
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise AppError.not_found('Category not found')

    child_count = db.query(Category).filter(Category.parentId == category_id).count()
    if child_count > 0:
        raise AppError.conflict('Category has child categories and cannot be deleted')

    db.delete(category)
    db.commit()