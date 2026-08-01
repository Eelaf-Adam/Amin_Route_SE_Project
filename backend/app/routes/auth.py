import os
import sys
import hashlib
import logging
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from jose import jwt
from sqlalchemy.orm import Session
from app.db import get_db
from app import models

logger = logging.getLogger("uvicorn.error")

router = APIRouter(
    tags=["Authentication"],
    prefix="/api/auth"
)

SECRET_KEY = os.getenv("SECRET_KEY", "amin_route_fallback_dev_key_not_for_production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str
    language_pref: str = "en"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

def hash_password(pwd: str) -> str:
    try:
        return pwd_context.hash(pwd)
    except Exception as e:
        logger.warning(f"bcrypt hash notice: {e}")
        return hashlib.sha256((pwd + "amin_salt_2026").encode('utf-8')).hexdigest()

def verify_password(plain: str, hashed: str) -> bool:
    try:
        if pwd_context.verify(plain, hashed):
            return True
    except Exception:
        pass
    fallback = hashlib.sha256((plain + "amin_salt_2026").encode('utf-8')).hexdigest()
    legacy = hashlib.sha256(plain.encode('utf-8')).hexdigest()
    return hashed == fallback or hashed == legacy


def create_access_token(user: models.User) -> str:
    expire = datetime.now(timezone.utc) + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    payload = {
        "sub": user.id,
        "email": user.email,
        "name": user.name,
        "exp": expire
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

from sqlalchemy import func

@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register_user(user_data: UserRegister, db: Session = Depends(get_db)):
    try:
        clean_email = user_data.email.lower().strip()
        existing_user = db.query(models.User).filter(func.lower(models.User.email) == clean_email).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="This email is already registered.")

        new_user = models.User(
            name=user_data.name.strip(),
            email=clean_email,
            password_hash=hash_password(user_data.password),
            language_pref=user_data.language_pref
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        token = create_access_token(new_user)

        return {
            "status": "success",
            "message": "Account created successfully.",
            "access_token": token,
            "token_type": "bearer",
            "user_id": new_user.id,
            "user": {
                "id": new_user.id,
                "name": new_user.name,
                "email": new_user.email,
                "language_pref": new_user.language_pref
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in register_user: {e}")
        raise HTTPException(status_code=500, detail=f"Registration error: {str(e)}")


@router.post("/login")
async def login_user(credentials: UserLogin, db: Session = Depends(get_db)):
    try:
        clean_email = credentials.email.lower().strip()
        user = db.query(models.User).filter(func.lower(models.User.email) == clean_email).first()

        if not user or not verify_password(credentials.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password."
            )

        token = create_access_token(user)

        return {
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "language_pref": user.language_pref
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in login_user: {e}")
        raise HTTPException(status_code=500, detail=f"Login error: {str(e)}")
