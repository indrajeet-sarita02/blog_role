import re


def _to_camel(name):
    parts = name.split('_')
    return parts[0] + ''.join(p.capitalize() for p in parts[1:])


def parse_pagination(query, default_sort='createdAt'):
    try:
        page = int(str(query.get('page') or '1'))
    except (TypeError, ValueError):
        page = 1
    page = max(page, 1)

    try:
        limit = int(str(query.get('limit') or '20'))
    except (TypeError, ValueError):
        limit = 20
    limit = max(min(limit, 100), 1)

    offset = (page - 1) * limit
    order = 'asc' if str(query.get('order') or 'desc').lower() == 'asc' else 'desc'
    sort = query.get('sort') or default_sort

    return page, limit, offset, sort, order


def sort_column(model, sort, default_attr='createdAt'):
    attr = _to_camel(sort)
    if not re.match(r'^[A-Za-z0-9_]+$', attr):
        attr = default_attr
    candidate = getattr(model, attr, None)
    if candidate is None:
        candidate = getattr(model, default_attr)
    return candidate


def order_by_clause(model, sort, order, default_attr='createdAt'):
    column = sort_column(model, sort, default_attr)
    return column.desc() if order == 'desc' else column.asc()