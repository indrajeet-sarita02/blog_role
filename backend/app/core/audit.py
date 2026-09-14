from app.core.context import get_context
from app.models import AuditLog


def write_audit(db, actor_id, action, module, entity_type=None, entity_id=None, old=None, new=None):
    ctx = get_context()
    db.add(AuditLog(
        userId=actor_id,
        action=action,
        module=module,
        entityType=entity_type,
        entityId=entity_id,
        oldValues=old,
        newValues=new,
        ipAddress=ctx['ip'],
        userAgent=ctx['user_agent'],
    ))