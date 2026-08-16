# created by Copilot CLI runtime in VS Code - placeholder
# This gives us clean application error
class AppException(Exception):
    # Base exception class for application errors
    def __init__(self, message: str, status_code: int = 400):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)
        
class NotFoundException(AppException):
    # Exception for not found resources
    def __init__(self, message: str = "Resource not found"):
        super().__init__(message, status_code=404)
        
class UnauthorizedException(AppException):
    # Exception for unauthorized access
    def __init__(self, message: str = "Unauthorized access"):
        super().__init__(message, status_code=401)