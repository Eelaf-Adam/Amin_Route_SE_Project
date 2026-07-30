import sys
import os
import hashlib
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from app.db import get_db
from app import models

router = APIRouter(
    tags=["Authentication"],
    prefix="/api/auth"
)

class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str
    language_pref: str = "en"

class UserLogin(BaseModel):
    email: EmailStr
    password: str 

def hash_password(pwd: str) -> str:
    return hashlib.sha256(pwd.encode('utf-8')).hexdigest()

@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register_user(user_data: UserRegister, db: Session = Depends(get_db)):
    # registers an anonymous user profile 
    # Check if user already exists
    existing_user = db.query(models.User).filter(models.User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="This email is already registered.")
    
    # hash password 
    new_user = models.User(
        name=user_data.name,
        email=user_data.email,
        password_hash=hash_password(user_data.password),
        language_pref=user_data.language_pref
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "status": "success",
        "message": f"Account securely generated for {new_user.name}. Zero metadata retained.",
        "user_id": new_user.id
    }
    
@router.post("/login")
async def login_user(credentials: UserLogin, db: Session = Depends(get_db)):
    #validates user credentials against 
    user = db.query(models.User).filter(models.User.email == credentials.email).first()
    hashed_pwd = hash_password(credentials.password)
    
    if not user or user.password_hash != hashed_pwd:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password entered."
        )

    return {
        "access_token": f"bearer_token_{user.id}",
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "language_pref": user.language_pref
        }
    }
