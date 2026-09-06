from datetime import timedelta
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User
from ..schemas import UserCreate, UserLogin, UserResponse, TokenResponse
from ..auth import hash_password, verify_password, create_access_token, require_current_user, get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def signup(payload: UserCreate, db: Session = Depends(get_db)):
    """Registers a new marine operator/scientist account and returns a JWT access token."""
    email_clean = payload.email.strip().lower()
    
    if not email_clean:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Official email address is required."
        )
    
    if len(payload.password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 6 characters long."
        )

    # Check if user already exists -> update password & profile seamlessly
    existing_user = db.query(User).filter(User.email.ilike(email_clean)).first()
    if existing_user:
        existing_user.hashed_password = hash_password(payload.password)
        existing_user.name = payload.name.strip()
        if payload.role:
            existing_user.role = payload.role
        if payload.organization:
            existing_user.organization = payload.organization
        db.commit()
        db.refresh(existing_user)

        token = create_access_token(
            data={"sub": existing_user.id, "email": existing_user.email, "role": existing_user.role}
        )

        return TokenResponse(
            access_token=token,
            token_type="bearer",
            user=UserResponse.from_orm(existing_user)
        )

    # Hash password & create user record
    hashed = hash_password(payload.password)
    user = User(
        name=payload.name.strip(),
        email=email_clean,
        hashed_password=hashed,
        role=payload.role or "Marine Scientist",
        organization=payload.organization or "VAINATEYA",
        phone=payload.phone
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Generate JWT token
    token = create_access_token(
        data={"sub": user.id, "email": user.email, "role": user.role}
    )

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.from_orm(user)
    )


@router.post("/signin", response_model=TokenResponse)
@router.post("/login", response_model=TokenResponse)
def signin(payload: UserLogin, db: Session = Depends(get_db)):
    """Authenticates hydrographic credentials and returns a signed JWT token."""
    email_clean = payload.email.strip().lower()

    user = db.query(User).filter(User.email.ilike(email_clean)).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No account found with this email. Please click 'Create Account' to register.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect password. You can click 'Create Account' to update your password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Generate JWT token
    token = create_access_token(
        data={"sub": user.id, "email": user.email, "role": user.role}
    )

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.from_orm(user)
    )


@router.get("/me", response_model=UserResponse)
def get_current_user_profile(user: User = Depends(require_current_user)):
    """Returns the authenticated operator's user profile."""
    return UserResponse.from_orm(user)


@router.get("/users", response_model=List[UserResponse])
def list_registered_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_current_user)
):
    """Lists registered operators in the system."""
    users = db.query(User).order_by(User.created_at.desc()).all()
    return [UserResponse.from_orm(u) for u in users]
