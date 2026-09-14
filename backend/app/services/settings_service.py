from app.core.audit import write_audit
from app.models import Setting


def list_settings(db, filters):
    try:
        page = max(int(str(filters.get('page') or '1')), 1)
    except (TypeError, ValueError):
        page = 1
    try:
        limit = max(min(int(str(filters.get('limit') or '20')), 100), 1)
    except (TypeError, ValueError):
        limit = 20
    offset = (page - 1) * limit

    q = db.query(Setting)
    if filters.get('search'):
        q = q.filter(Setting.key.like('%{}%'.format(filters['search'])))

    total = q.count()
    rows = q.order_by(Setting.key.asc()).offset(offset).limit(limit).all()

    flat = {}
    for s in rows:
        flat[s.key] = s.value

    return {
        'settings': flat,
        'meta': {'page': page, 'limit': limit, 'total': total, 'totalPages': (total + limit - 1) // limit},
    }


def update_settings(db, actor_id, updates):
    for key, value in updates.items():
        setting = db.query(Setting).filter(Setting.key == key).first()
        if setting is None:
            setting = Setting(key=key, value=value)
            db.add(setting)
        elif setting.value != value:
            setting.value = value
        db.flush()

    write_audit(db, actor_id, 'SETTINGS_UPDATED', 'setting', new=updates)
    db.commit()

    keys = list(updates.keys())
    rows = db.query(Setting).filter(Setting.key.in_(keys)).all()
    flat = {}
    for s in rows:
        flat[s.key] = s.value
    return flat