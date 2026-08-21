# created by Copilot CLI runtime in VS Code - placeholder
from fastapi import APIRouter, status, BackgroundTasks, Depends, Request
from app.schemas.user import UserRegister, UserResponse, UserLogin, GoogleLoginRequest, ForgotPasswordRequest, ResetPasswordRequest
from app.modules.auth.service import auth_service
from app.core.security import get_current_user
from app.core.rate_limit import limiter
from typing import Any

router = APIRouter(prefix="/auth", tags=["Authentication"])

def get_field(user: Any, field_name: str, fallback_field: str = None) -> Any:
    """Safely extracts field from dict or Pydantic object."""
    if isinstance(user, dict):
        return user.get(field_name) or (user.get(fallback_field) if fallback_field else None)
    val = getattr(user, field_name, None)
    if val is None and fallback_field:
        val = getattr(user, fallback_field, None)
    return val

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user: UserRegister, background_tasks: BackgroundTasks):
    return auth_service.register_user(user, background_tasks)

@router.post("/login")
@limiter.limit("5/minute")
def login(request: Request, user: UserLogin):
    return auth_service.login_user(user)

@router.post("/forgot-password")
def forgot_password(data: ForgotPasswordRequest, background_tasks: BackgroundTasks):
    return auth_service.forgot_password(data,background_tasks)

@router.post("/reset-password")
def reset_password(data: ResetPasswordRequest):
    return auth_service.reset_password(data)

@router.post("/google")
@limiter.limit("10/minute")
def google_login(request: Request, data: GoogleLoginRequest):
    return auth_service.google_login(data.token)

@router.get("/me", response_model=UserResponse)
def get_current_user_endpoint(current_user: dict = Depends(get_current_user)):
    """Get the current authenticated user's information."""
    return UserResponse(
        id=current_user["id"],
        name=current_user["name"],
        email=current_user["email"]
    )
