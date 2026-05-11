from pydantic import BaseModel, EmailStr
from typing import Optional
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import declarative_base

Base = declarative_base()

# -----------------------
# Pydantic schemas (API)
# -----------------------

class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    confirm_password: str


class TaskCreate(BaseModel):
    title: str
    description: str = ""


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None


# -----------------------
# SQLAlchemy models (DB)
# -----------------------

class UserDB(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)
    session = Column(String, nullable=True)
    theme = Column(String, default="light")


class TaskDB(Base):
    __tablename__ = "tasks"

    task_id = Column(String, primary_key=True, index=True)
    title = Column(String)
    description = Column(String)
    status = Column(String)
    priority = Column(String)
    user_id = Column(Integer, ForeignKey("users.user_id"))