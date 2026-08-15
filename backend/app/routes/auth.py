
from fastapi import APIRouter, HTTPException
from app.database import users
from app.schemas.user import UserRegister, UserLogin
from app.core.security import hash_pass, verify_pass, create_access_token

router = APIRouter(prefix="/auth", tags=['Authentication'])

@router.post("/register")
def register_user(user: UserRegister):
    existing_user = users.find_one(
        {"email": user.email}
    )
    
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Already Register"
        )
    
    # Hash password 
    hashed_pass = hash_pass(user.password)
    
    # create
    new_user = {
        "name":user.name,
        "email":user.email,
        "password_hash":hashed_pass,
    }
     # Save to MongoDB
    res = users.insert_one(new_user)

    return {
        "message": "User registered successfully",
        "user_id": str(res.inserted_id)
    }
   
@router.post("/login") 
def login_user(user: UserLogin):
    # find user
    db_user = users.find_one({"email": user.email})
    
    if not db_user:
        raise HTTPException(status_code=401, detail="Invalid email or pass")
    
    # verify pass
    if not verify_pass(user.password, db_user['pass_hash']):
        raise HTTPException(status_code=401, detail="Invalid email or pass")
    
    # create jwt
    token = create_access_token({"sub": str(db_user["id"])})
    return {"access_token": token, "token_type": 'bearer'}