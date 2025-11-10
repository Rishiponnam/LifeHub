from pydantic import BaseModel, EmailStr
from typing import Optional  # Import Optional from typing
from .profile import UserProfile

# Shared properties
class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None  # Use Optional[str] instead of str | None

# Properties to receive via API on creation
class UserCreate(UserBase):
    password: str

# Properties to receive via API on update
class UserUpdate(BaseModel):
    password: Optional[str] = None  # Use Optional[str] instead of str | None
    full_name: Optional[str] = None  # Use Optional[str] instead of str | None
    email: Optional[EmailStr] = None  # Use Optional[EmailStr] instead of EmailStr | None

# # Properties shared by models stored in DB
# class UserInDBBase(UserBase):
#     id: int
#     is_active: bool

#     class Config:
#         from_attributes = True

# # Properties to return to client
# class User(UserInDBBase):
#     pass

# Properties shared by models stored in DB
class UserInDBBase(BaseModel): # Renamed from UserBase in previous step
    id: int
    full_name: Optional[str] = None
    email: EmailStr
    is_active: bool

    class Config:
        from_attributes = True

# Properties to return to client
class User(UserInDBBase):
    profile: Optional[UserProfile] = None # Nest the profile here!

# Properties stored in DB
class UserInDB(UserInDBBase):
    hashed_password: str