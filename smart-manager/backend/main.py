from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import inspect, text
from sqlalchemy.orm import Session

from .database import Base, engine, get_db
from .models import LoginRequest, RegisterRequest, TaskCreate, TaskDB, TaskRead, TaskUpdate, TokenResponse, UserDB, UserRead
from .security import create_access_token, get_current_user, hash_password, verify_password

Base.metadata.create_all(bind=engine)


def ensure_task_columns():
    inspector = inspect(engine)
    if 'tasks' not in inspector.get_table_names():
        return
    columns = {column['name'] for column in inspector.get_columns('tasks')}
    if 'deadline' not in columns:
        with engine.begin() as connection:
            connection.execute(text('ALTER TABLE tasks ADD COLUMN deadline VARCHAR(32)'))


ensure_task_columns()

app = FastAPI(title='Smart Manager API')

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        'http://localhost:5173',
        'http://127.0.0.1:5173',
    ],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)


@app.get('/health')
def health():
    return {'status': 'ok'}


@app.post('/auth/register', response_model=UserRead, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    if payload.confirm_password is not None and payload.password != payload.confirm_password:
        raise HTTPException(status_code=400, detail='Пароли не совпадают')

    existing_user = db.query(UserDB).filter(UserDB.email == payload.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail='Пользователь с такой почтой уже зарегистрирован')

    user = UserDB(
        name=payload.name.strip(),
        email=payload.email.lower(),
        password_hash=hash_password(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@app.post('/auth/login', response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(UserDB).filter(UserDB.email == payload.email.lower()).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Неверная электронная почта или пароль')

    return {'access_token': create_access_token(user), 'token_type': 'bearer', 'user': user}


@app.get('/auth/me', response_model=UserRead)
def auth_me(current_user: UserDB = Depends(get_current_user)):
    return current_user


@app.get('/users/me', response_model=UserRead)
def users_me(current_user: UserDB = Depends(get_current_user)):
    return current_user


@app.get('/tasks', response_model=list[TaskRead])
def list_tasks(
    db: Session = Depends(get_db),
    current_user: UserDB = Depends(get_current_user),
):
    return (
        db.query(TaskDB)
        .filter(TaskDB.owner_id == current_user.id)
        .order_by(TaskDB.created_at.desc())
        .all()
    )


@app.post('/tasks', response_model=TaskRead, status_code=status.HTTP_201_CREATED)
def create_task(
    payload: TaskCreate,
    db: Session = Depends(get_db),
    current_user: UserDB = Depends(get_current_user),
):
    task = TaskDB(
        title=payload.title.strip(),
        description=payload.description or '',
        status='todo',
        priority=payload.priority or 'medium',
        deadline=payload.deadline,
        owner_id=current_user.id,
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@app.put('/tasks/{task_id}', response_model=TaskRead)
def update_task(
    task_id: int,
    payload: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: UserDB = Depends(get_current_user),
):
    task = db.query(TaskDB).filter(TaskDB.id == task_id, TaskDB.owner_id == current_user.id).first()
    if not task:
        raise HTTPException(status_code=404, detail='Задача не найдена')

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if value is not None:
            setattr(task, field, value)

    db.commit()
    db.refresh(task)
    return task


@app.delete('/tasks/{task_id}', status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: UserDB = Depends(get_current_user),
):
    task = db.query(TaskDB).filter(TaskDB.id == task_id, TaskDB.owner_id == current_user.id).first()
    if not task:
        raise HTTPException(status_code=404, detail='Задача не найдена')

    db.delete(task)
    db.commit()
    return None
