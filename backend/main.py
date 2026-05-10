from uuid import uuid4
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, HTMLResponse
from pathlib import Path
from .models import LoginRequest, RegisterRequest, TaskCreate, Task, User
from .storage import load_db, save_db

ROOT_DIR = Path(__file__).resolve().parent.parent

app = FastAPI(title='Smart Task Manager API')
app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)


@app.middleware('http')
async def disable_cache(request, call_next):
    response = await call_next(request)
    response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '0'
    return response


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


@app.get('/styles.css')
def styles_file():
    return FileResponse(ROOT_DIR / 'styles.css')


@app.get('/auth.js')
def auth_js_file():
    return FileResponse(ROOT_DIR / 'auth.js')


@app.get('/app.js')
def app_js_file():
    return FileResponse(ROOT_DIR / 'app.js')


app.mount('/static', StaticFiles(directory=ROOT_DIR, html=False), name='static')


@app.get('/', response_class=HTMLResponse)
def root():
    return """<!doctype html><html lang='ru'><head><meta charset='UTF-8'><meta name='viewport' content='width=device-width, initial-scale=1'><title>Auth | Smart Tasks</title><link href='https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css' rel='stylesheet'><style>body{background:#f5f7fb}.card-soft{border-radius:16px;border:1px solid #dee2e6;box-shadow:0 8px 24px rgba(0,0,0,.05)}</style></head><body><main class='container py-5'><div class='row justify-content-center'><div class='col-12 col-md-6 col-lg-4'><div class='card card-soft p-4'><h3 class='mb-3' id='authTitle'>Вход</h3><form id='loginForm' class='d-grid gap-2'><input id='loginEmail' type='email' class='form-control' placeholder='Email' required><input id='loginPassword' type='password' class='form-control' placeholder='Пароль' minlength='6' required><button class='btn btn-primary' type='submit'>Войти</button></form><form id='registerForm' class='d-grid gap-2 d-none'><input id='regName' class='form-control' placeholder='Имя' required><input id='regEmail' type='email' class='form-control' placeholder='Email' required><input id='regPassword' type='password' class='form-control' placeholder='Пароль' minlength='6' required><input id='regConfirm' type='password' class='form-control' placeholder='Повтор пароля' minlength='6' required><button class='btn btn-primary' type='submit'>Зарегистрироваться</button></form><button type='button' id='switchMode' class='btn btn-link mt-2 px-0'>Нет аккаунта? Регистрация</button></div></div></div></main><script>const API='/api';let registerMode=false;if(localStorage.getItem('isAuth')==='1')location.replace('/app#/dashboard');async function api(path,options={}){const r=await fetch(`${API}${path}`,{headers:{'Content-Type':'application/json'},...options});if(!r.ok)throw new Error((await r.json()).detail||'API error');return r.json();}const loginForm=document.getElementById('loginForm');const registerForm=document.getElementById('registerForm');const switchMode=document.getElementById('switchMode');const authTitle=document.getElementById('authTitle');switchMode.addEventListener('click',()=>{registerMode=!registerMode;loginForm.classList.toggle('d-none',registerMode);registerForm.classList.toggle('d-none',!registerMode);authTitle.textContent=registerMode?'Регистрация':'Вход';switchMode.textContent=registerMode?'Уже есть аккаунт? Войти':'Нет аккаунта? Регистрация';});loginForm.addEventListener('submit',async(e)=>{e.preventDefault();try{await api('/auth/login',{method:'POST',body:JSON.stringify({email:loginEmail.value,password:loginPassword.value})});localStorage.setItem('isAuth','1');location.replace('/app#/dashboard');}catch(err){alert(err.message);}});registerForm.addEventListener('submit',async(e)=>{e.preventDefault();try{await api('/auth/register',{method:'POST',body:JSON.stringify({name:regName.value,email:regEmail.value,password:regPassword.value,confirm_password:regConfirm.value})});localStorage.setItem('isAuth','1');location.replace('/app#/dashboard');}catch(err){alert(err.message);}});</script></body></html>"""


@app.get('/app')
def app_page():
    return FileResponse(ROOT_DIR / 'index.html')
