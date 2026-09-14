class AppError(Exception):
    def __init__(self, status_code, message, code='INTERNAL_SERVER_ERROR', details=None):
        super().__init__(message)
        self.status_code = status_code
        self.message = message
        self.code = code
        self.details = details

    @classmethod
    def bad_request(cls, message, details=None):
        return cls(400, message, 'VALIDATION_ERROR', details)

    @classmethod
    def unauthorized(cls, message='Unauthorized'):
        return cls(401, message, 'UNAUTHORIZED')

    @classmethod
    def forbidden(cls, message='You do not have permission to perform this action'):
        return cls(403, message, 'FORBIDDEN')

    @classmethod
    def not_found(cls, message='Resource not found'):
        return cls(404, message, 'NOT_FOUND')

    @classmethod
    def conflict(cls, message='Conflict'):
        return cls(409, message, 'CONFLICT')