import threading

_local = threading.local()


def capture(request):
    xff = request.headers.get('x-forwarded-for')
    ip = (xff.split(',')[0].strip() if xff else None) or (request.client.host if request.client else '')
    ua = (request.headers.get('user-agent') or '')[:500]
    _local.ip = str(ip or '')
    _local.user_agent = str(ua or '')
    return _local.ip, _local.user_agent


def get_context():
    return {
        'ip': getattr(_local, 'ip', ''),
        'user_agent': getattr(_local, 'user_agent', ''),
    }