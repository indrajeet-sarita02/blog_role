from fastapi.responses import JSONResponse, Response


def ok(data, message='Success', status=200):
    return JSONResponse(
        status_code=status,
        content={'success': True, 'message': message, 'data': data},
    )


def created(data, message='Created successfully'):
    return ok(data, message, 201)


def no_content():
    return Response(status_code=204)


def list_response(data, meta, message='Success'):
    return JSONResponse(
        status_code=200,
        content={'success': True, 'message': message, 'data': data, 'meta': meta},
    )


def o(obj, schema):
    if obj is None:
        return None
    return schema.from_orm(obj).dict()


def os(objs, schema):
    return [schema.from_orm(item).dict() for item in objs]