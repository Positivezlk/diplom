from uuid import uuid4
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from pathlib import Path
from .models import LoginRequest, RegisterRequest, TaskCreate, Task, User
from .storage import load_db, save_db

ROOT_DIR = Path(__file__).resolve().parent.parent


from .models import LoginRequest, RegisterRequest, TaskCreate, Task, User
from .storage import load_db, save_db

app = FastAPI(title='Smart Task Manager API')
app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)


@app.get('/api/health')
def health():
    return {'ok': True}


@app.post('/api/auth/login', response_model=User)
def login(payload: LoginRequest):
    db = load_db()
    if len(payload.password) < 6:
        raise HTTPException(status_code=400, detail='Пароль слишком короткий')
    db['user'] = {'name': db.get('user', {}).get('name', 'User'), 'email': payload.email}
    save_db(db)
    return db['user']


@app.post('/api/auth/register', response_model=User)
def register(payload: RegisterRequest):
    if payload.password != payload.confirm_password:
        raise HTTPException(status_code=400, detail='Пароли не совпадают')
    db = load_db()
    db['user'] = {'name': payload.name, 'email': payload.email}
    save_db(db)
    return db['user']


@app.get('/api/profile', response_model=User)
def get_profile():
    db = load_db()
    return db['user']


@app.get('/api/tasks', response_model=list[Task])
def list_tasks():
    db = load_db()
    return db['tasks']


@app.post('/api/tasks', response_model=Task)
def create_task(payload: TaskCreate):
    db = load_db()
    task = payload.model_dump()
    task['id'] = str(uuid4())
    db['tasks'].insert(0, task)
    save_db(db)
    return task


@app.patch('/api/tasks/{task_id}', response_model=Task)
def update_task(task_id: str, payload: TaskCreate):
    db = load_db()
    for i, t in enumerate(db['tasks']):
        if t['id'] == task_id:
            updated = payload.model_dump()
            updated['id'] = task_id
            db['tasks'][i] = updated
            save_db(db)
            return updated
    raise HTTPException(status_code=404, detail='Task not found')


@app.patch('/api/tasks/{task_id}/status', response_model=Task)
def update_status(task_id: str, status: str):
    db = load_db()
    for t in db['tasks']:
        if t['id'] == task_id:
            t['status'] = status
            save_db(db)
            return t
    raise HTTPException(status_code=404, detail='Task not found')


@app.delete('/api/tasks/{task_id}')
def delete_task(task_id: str):
    db = load_db()
    db['tasks'] = [t for t in db['tasks'] if t['id'] != task_id]
    save_db(db)
    return {'ok': True}


@app.post('/api/theme')
def set_theme(theme: str):
    db = load_db()
    db['theme'] = theme
    save_db(db)
    return {'theme': theme}


@app.get('/api/theme')
def get_theme():
    db = load_db()
    return {'theme': db.get('theme', 'light')}



app.mount('/assets', StaticFiles(directory=ROOT_DIR, html=False), name='assets')

app.mount('/assets', StaticFiles(directory='.', html=False), name='assets')



@app.get('/')
def index():

    return FileResponse(ROOT_DIR / 'index.html')

    return FileResponse('index.html')

