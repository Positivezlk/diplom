from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from uuid import uuid4
import uuid

from .database import SessionLocal, engine
from .models import Base, UserDB, TaskDB, LoginRequest, RegisterRequest, TaskCreate, TaskUpdate
from .security import hash_password, verify_password

# -----------------------
# INIT
# -----------------------
Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------
# DB DEPENDENCY
# -----------------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# -----------------------
# AUTH
# -----------------------

@app.post("/api/register")
def register(payload: RegisterRequest, db: Session = Depends(get_db)):

    user = db.query(UserDB).filter(UserDB.email == payload.email).first()

    if user:
        raise HTTPException(400, "Email already exists")

    if payload.password != payload.confirm_password:
        raise HTTPException(400, "Passwords do not match")

    new_user = UserDB(
        name=payload.name,
        email=payload.email,
        password=hash_password(payload.password)
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"ok": True}


@app.post("/api/login")
def login(payload: LoginRequest, db: Session = Depends(get_db)):

    user = db.query(UserDB).filter(UserDB.email == payload.email).first()

    if not user:
        raise HTTPException(404, "User not found")

    if not verify_password(payload.password, user.password):
        raise HTTPException(401, "Wrong password")

    # простая "сессия"
    session_id = str(uuid.uuid4())
    user.session = session_id

    db.commit()

    return {
        "ok": True,
        "session": session_id,
        "user": {
            "id": user.user_id,
            "name": user.name,
            "email": user.email
        }
    }

# -----------------------
# TASKS (USER BASED)
# -----------------------

def get_user_by_session(db: Session, session: str):
    return db.query(UserDB).filter(UserDB.session == session).first()


@app.get("/api/tasks")
def list_tasks(session: str, db: Session = Depends(get_db)):

    user = get_user_by_session(db, session)

    if not user:
        raise HTTPException(401, "Unauthorized")

    tasks = db.query(TaskDB).filter(TaskDB.user_id == user.user_id).all()

    return tasks


@app.post("/api/tasks")
def create_task(
    payload: TaskCreate,
    session: str,
    db: Session = Depends(get_db)
):

    user = get_user_by_session(db, session)

    if not user:
        raise HTTPException(401, "Unauthorized")

    task = TaskDB(
        task_id=str(uuid4()),
        title=payload.title,
        description=payload.description,
        status="todo",
        priority="medium",
        user_id=user.user_id
    )

    db.add(task)
    db.commit()
    db.refresh(task)

    return task


@app.delete("/api/tasks/{task_id}")
def delete_task(task_id: str, session: str, db: Session = Depends(get_db)):

    user = get_user_by_session(db, session)

    if not user:
        raise HTTPException(401, "Unauthorized")

    task = db.query(TaskDB).filter(
        TaskDB.task_id == task_id,
        TaskDB.user_id == user.user_id
    ).first()

    if not task:
        raise HTTPException(404, "Task not found")

    db.delete(task)
    db.commit()

    return {"ok": True}


@app.patch("/api/tasks/{task_id}")
def update_task(task_id: str, payload: TaskUpdate, session: str, db: Session = Depends(get_db)):

    user = get_user_by_session(db, session)

    if not user:
        raise HTTPException(401, "Unauthorized")

    task = db.query(TaskDB).filter(
        TaskDB.task_id == task_id,
        TaskDB.user_id == user.user_id
    ).first()

    if not task:
        raise HTTPException(404, "Task not found")

    if payload.title is not None:
        task.title = payload.title

    if payload.description is not None:
        task.description = payload.description

    if payload.status is not None:
        task.status = payload.status

    if payload.priority is not None:
        task.priority = payload.priority

    db.commit()
    db.refresh(task)

    return task