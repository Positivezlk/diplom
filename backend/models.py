from pydantic import BaseModel, EmailStr
from typing import Literal

TaskStatus = Literal['todo', 'in_progress', 'done', 'overdue']
TaskPriority = Literal['low', 'medium', 'high']


class User(BaseModel):
    name: str
    email: EmailStr


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
    description: str = ''
    deadline: str
    priority: TaskPriority = 'medium'
    category: str = 'General'
    status: TaskStatus = 'todo'


class Task(TaskCreate):
    id: str
