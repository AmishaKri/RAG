# created by Copilot CLI runtime in VS Code - placeholder
from fastapi import APIRouter, status, BackgroundTasks, Depends
from app.schemas.user import UserRegister, UserResponse, UserLogin, ForgotPasswordRequest,ResetPasswordRequest
from app.modules.auth.service import auth_service
from app.core.security import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user: UserRegister, background_tasks: BackgroundTasks):
    return auth_service.register_user(user, background_tasks)

@router.post("/login")
def login(user: UserLogin):
    return auth_service.login_user(user)

@router.post("/forgot-password")
def forgot_password(data: ForgotPasswordRequest, background_tasks: BackgroundTasks):
    return auth_service.forgot_password(data,background_tasks)

@router.post("/reset-password")
def reset_password(data: ResetPasswordRequest):
    return auth_service.reset_password(data)

@router.get("/me", response_model=UserResponse)
def get_current_user_endpoint(current_user: dict = Depends(get_current_user)):
    """Get the current authenticated user's information."""
    return UserResponse(
        id=current_user["id"],
        name=current_user["name"],
        email=current_user["email"]
    )
