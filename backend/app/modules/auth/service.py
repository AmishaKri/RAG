<<<<<<< Updated upstream
# created by Copilot CLI runtime in VS Code - placeholder
=======
from fastapi import HTTPException, status, BackgroundTasks
from app.db.mongodb import users
from app.schemas.user import (
    UserRegister,
    UserLogin,
    UserResponse,
    ForgotPasswordRequest,
    ResetPasswordRequest,
)
from app.core.security import (
    hash_pass,
    verify_pass,
    create_access_token,
    create_password_reset_token,
    verify_password_reset_token,
)
from app.services.email import send_welcome_email, send_password_reset_email
from pymongo.errors import PyMongoError

class AuthService:
    @staticmethod
    def register_user(user_data: UserRegister, background_tasks: BackgroundTasks) -> UserResponse:
        try:
            email_normalized = user_data.email.lower()

            if users.find_one({"email": email_normalized}):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email is already registered",
                )

            hashed_password = hash_pass(user_data.password)

            new_user = {
                "name": user_data.name,
                "email": email_normalized,
                "password_hash": hashed_password,
            }

            res = users.insert_one(new_user)
            # background_tasks.add_task(send_welcome_email, email_normalized, user_data.name)

            return UserResponse(
                id=str(res.inserted_id),
                name=new_user["name"],
                email=new_user["email"],
            )
        except PyMongoError as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database error: {str(e)}"
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Registration failed: {str(e)}"
            )

    @staticmethod
    def login_user(user_data: UserLogin) -> dict:
        email_normalized = user_data.email.lower()
        db_user = users.find_one({"email": email_normalized})

        if not db_user or not verify_pass(user_data.password, db_user.get("password_hash", "")):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )

        token = create_access_token({"sub": str(db_user["_id"])})
        return {"access_token": token, "token_type": "bearer"}

    @staticmethod
    def forgot_password(data: ForgotPasswordRequest, background_tasks: BackgroundTasks) -> dict:
        email_normalized = data.email.lower()
        db_user = users.find_one({"email": email_normalized})

        # Security practice:
        if db_user:
            reset_token = create_password_reset_token(email_normalized)
            background_tasks.add_task(send_password_reset_email, email_normalized, reset_token)

        return {
            "message": "If this email is registered, a password reset link has been sent to your inbox."
        }

    @staticmethod
    def reset_password(data: ResetPasswordRequest) -> dict:
        
        email = verify_password_reset_token(data.token)

        if not email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired reset token",
            )

        # Hash new password
        new_hashed_password = hash_pass(data.new_password)

        # Update in MongoDB
        result = users.update_one(
            {"email": email},
            {"$set": {"password_hash": new_hashed_password}},
        )

        if result.matched_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )

        return {"message": "Password has been successfully reset. You can now login with your new password."}

auth_service = AuthService()
>>>>>>> Stashed changes
