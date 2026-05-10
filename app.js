
const API = '/api';
const store = { theme: 'light', user: { name: 'Alex', email: 'alex@mail.com' }, tasks: [], isAuth: localStorage.getItem('isAuth') === '1' };

const API = '/api';
const store = { theme: 'light', user: { name: 'Alex', email: 'alex@mail.com' }, tasks: [] };

const view = document.getElementById('view');

async function api(path, options = {}) {
  const r = await fetch(`${API}${path}`, { headers: { 'Content-Type': 'application/json' }, ...options });
  if (!r.ok) throw new Error((await r.json()).detail || 'API error');
  return r.json();
}

async function bootstrap() {
  try {
    store.tasks = await api('/tasks');
    store.user = await api('/profile');
    store.theme = (await api('/theme')).theme;
  } catch (e) {
    console.error(e);
  }
  applyTheme();
  route();
}

function route() {
  const path = location.hash.replace('#', '') || '/login';

  const publicRoutes = ['/login', '/register'];
  if (!store.isAuth && !publicRoutes.includes(path)) {
    location.hash = '/login';
    return;
  }
  if (store.isAuth && publicRoutes.includes(path)) {
    location.hash = '/dashboard';
    return;
  }

  if (path === '/login') return renderLogin();
  if (path === '/register') return renderRegister();
  if (path === '/dashboard') return renderDashboard();
  if (path === '/tasks') return renderTasks();
  if (path === '/profile') return renderProfile();
  if (path === '/settings') return renderSettings();
  return render404();
}

function renderLogin() {
  view.innerHTML = `<div class="row justify-content-center"><div class="col-12 col-md-5"><div class="card card-soft p-4"><h3>Вход</h3><form id="loginForm" class="d-grid gap-2"><input id="email" type="email" class="form-control" required placeholder="Email"><input id="password" type="password" class="form-control" required minlength="6" placeholder="Пароль"><button class="btn btn-primary">Войти</button></form><button class="btn btn-outline-danger mt-2">Google (mock)</button><a href="#/register" class="mt-3 d-inline-block">Регистрация</a></div></div></div>`;

  loginForm.onsubmit = async (e) => { e.preventDefault(); try { store.user = await api('/auth/login', { method: 'POST', body: JSON.stringify({ email: email.value, password: password.value }) }); store.isAuth = true; localStorage.setItem('isAuth', '1'); location.hash = '/dashboard'; } catch (err) { alert(err.message); } };

  loginForm.onsubmit = async (e) => { e.preventDefault(); try { store.user = await api('/auth/login', { method: 'POST', body: JSON.stringify({ email: email.value, password: password.value }) }); location.hash = '/dashboard'; } catch (err) { alert(err.message); } };

}

function renderRegister() {
  view.innerHTML = `<div class="row justify-content-center"><div class="col-12 col-md-5"><div class="card card-soft p-4"><h3>Регистрация</h3><form id="regForm" class="d-grid gap-2"><input id="name" class="form-control" required placeholder="Имя"><input id="email" type="email" class="form-control" required placeholder="Email"><input type="password" id="p1" class="form-control" required placeholder="Пароль"><input type="password" id="p2" class="form-control" required placeholder="Повтор пароля"><button class="btn btn-primary">Создать</button></form><a href="#/login" class="mt-3 d-inline-block">На вход</a></div></div></div>`;

  regForm.onsubmit = async (e) => { e.preventDefault(); try { store.user = await api('/auth/register', { method: 'POST', body: JSON.stringify({ name: name.value, email: email.value, password: p1.value, confirm_password: p2.value }) }); store.isAuth = true; localStorage.setItem('isAuth', '1'); location.hash = '/dashboard'; } catch (err) { alert(err.message); } };

  regForm.onsubmit = async (e) => { e.preventDefault(); try { store.user = await api('/auth/register', { method: 'POST', body: JSON.stringify({ name: name.value, email: email.value, password: p1.value, confirm_password: p2.value }) }); location.hash = '/login'; } catch (err) { alert(err.message); } };

}

function renderDashboard() {
  const total = store.tasks.length, done = store.tasks.filter(t => t.status === 'done').length, overdue = store.tasks.filter(t => t.status === 'overdue').length, progress = store.tasks.filter(t => t.status === 'in_progress').length;
  view.innerHTML = `<div class="row g-3">${[['Всего задач', total], ['Выполнено', done], ['Просрочено', overdue], ['В процессе', progress]].map(s => `<div class="col-6 col-xl-3"><div class="card card-soft p-3"><small class="text-secondary">${s[0]}</small><div class="display-6">${s[1]}</div></div></div>`).join('')}<div class="col-12"><div class="card card-soft p-3">Ближайшие задачи, выполненные задачи и график продуктивности (mock).</div></div></div><button class="btn btn-primary fab" onclick="location.hash='/tasks'">+</button>`;
}

function renderTasks() {
  view.innerHTML = `<div class="card card-soft p-3 mb-3"><form id="taskForm" class="row g-2"><div class="col-12 col-md-3"><input class="form-control" id="title" required placeholder="Название"></div><div class="col-6 col-md-2"><input class="form-control" id="deadline" type="date" required></div><div class="col-6 col-md-2"><select id="priority" class="form-select"><option>low</option><option selected>medium</option><option>high</option></select></div><div class="col-12 col-md-2"><input class="form-control" id="category" placeholder="Категория"></div><div class="col-12 col-md-3"><button class="btn btn-primary w-100">Добавить</button></div><div class="col-12"><textarea id="desc" class="form-control" placeholder="Описание"></textarea></div></form></div>
  <div class="row g-2 mb-3"><div class="col-12 col-md-4"><input id="q" class="form-control" placeholder="Поиск"></div><div class="col-6 col-md-3"><select id="fStatus" class="form-select"><option value="">Статус: все</option><option>todo</option><option>in_progress</option><option>done</option><option>overdue</option></select></div><div class="col-6 col-md-3"><select id="fPriority" class="form-select"><option value="">Приоритет: все</option><option>low</option><option>medium</option><option>high</option></select></div></div>
  <div id="taskList" class="row g-3"></div>
  <div class="card card-soft p-3 mt-3"><b>Голосовой помощник (mock)</b><div class="mt-2 d-flex gap-2"><button class="btn btn-danger" id="mic">🎙️</button><input class="form-control" id="voiceText" placeholder="Скажи: создай задачу..."/><button class="btn btn-outline-primary" id="voiceSend">Отправить</button></div><div class="small text-secondary mt-2" id="voiceResp">Ожидание команды...</div></div>`;

  const renderList = () => {
    const q = document.getElementById('q')?.value?.toLowerCase() || '';
    const fs = document.getElementById('fStatus')?.value || '';
    const fp = document.getElementById('fPriority')?.value || '';
    let list = store.tasks.filter(t => (t.title + t.description).toLowerCase().includes(q));
    if (fs) list = list.filter(t => t.status === fs);
    if (fp) list = list.filter(t => t.priority === fp);
    document.getElementById('taskList').innerHTML = list.length ? list.map(t => `<div class="col-12 col-lg-6"><div class="card card-soft p-3"><div class="d-flex justify-content-between"><h5>${t.title}</h5><button class="btn btn-sm btn-outline-danger" onclick="delTask('${t.id}')">Удалить</button></div><p>${t.description || ''}</p><div class="d-flex gap-2 flex-wrap"><span class="badge text-bg-secondary">${t.category || 'General'}</span><span class="badge text-bg-info">${t.priority}</span><span class="badge text-bg-dark">${t.deadline}</span><select class="form-select form-select-sm w-auto" onchange="setStatus('${t.id}',this.value)"><option ${t.status === 'todo' ? 'selected' : ''}>todo</option><option ${t.status === 'in_progress' ? 'selected' : ''}>in_progress</option><option ${t.status === 'done' ? 'selected' : ''}>done</option><option ${t.status === 'overdue' ? 'selected' : ''}>overdue</option></select></div></div></div>`).join('') : '<div class="col-12"><div class="card card-soft p-3">Пусто: задач нет</div></div>';
  };

  ['q', 'fStatus', 'fPriority'].forEach(id => document.getElementById(id).oninput = renderList);
  taskForm.onsubmit = async (e) => {
    e.preventDefault();
    const created = await api('/tasks', { method: 'POST', body: JSON.stringify({ title: title.value, description: desc.value, deadline: deadline.value, priority: priority.value, category: category.value || 'General', status: 'todo' }) });
    store.tasks.unshift(created);
    taskForm.reset();
    renderList();
  };
  mic.onclick = () => { voiceText.value = 'Создай задачу закончить проект завтра'; voiceResp.innerText = 'Запись...'; setTimeout(() => voiceResp.innerText = 'Задача успешно создана (mock)', 700); };
  voiceSend.onclick = () => voiceResp.innerText = 'Задача успешно создана (mock)';
  renderList();
}

window.delTask = async id => { await api(`/tasks/${id}`, { method: 'DELETE' }); store.tasks = store.tasks.filter(t => t.id !== id); renderTasks(); };
window.setStatus = async (id, status) => { const updated = await api(`/tasks/${id}/status?status=${status}`, { method: 'PATCH' }); const idx = store.tasks.findIndex(t => t.id === id); if (idx >= 0) store.tasks[idx] = updated; };

function renderProfile() {

  view.innerHTML = `<div class="card card-soft p-4"><div class="d-flex align-items-center gap-3"><div class="rounded-circle bg-primary" style="width:72px;height:72px"></div><div><h4>${store.user.name}</h4><p class="mb-0">${store.user.email}</p></div></div><hr><p>Продуктивность: ${store.tasks.filter(t => t.status === 'done').length}/${store.tasks.length || 0}</p><button class="btn btn-outline-danger" onclick="logout()">Logout</button></div>`;

  view.innerHTML = `<div class="card card-soft p-4"><div class="d-flex align-items-center gap-3"><div class="rounded-circle bg-primary" style="width:72px;height:72px"></div><div><h4>${store.user.name}</h4><p class="mb-0">${store.user.email}</p></div></div><hr><p>Продуктивность: ${store.tasks.filter(t => t.status === 'done').length}/${store.tasks.length || 0}</p><button class="btn btn-outline-danger" onclick="location.hash='/login'">Logout</button></div>`;

}
function renderSettings() {
  view.innerHTML = `<div class="card card-soft p-4"><h4>Настройки</h4><div class="form-check form-switch my-3"><input class="form-check-input" type="checkbox" id="t" ${store.theme === 'dark' ? 'checked' : ''}><label class="form-check-label" for="t">Тёмная тема</label></div><div class="mb-3"><label class="form-label">Язык</label><select class="form-select"><option selected>Русский</option><option>English</option></select></div><div class="mb-3"><label class="form-label">Уведомления</label><select class="form-select"><option>Включены</option><option>Выключены</option></select></div><div><label class="form-label">Голосовой ассистент</label><select class="form-select"><option>Стандартный</option><option>Минимальный</option></select></div></div>`;
  document.getElementById('t').onchange = async (e) => { store.theme = e.target.checked ? 'dark' : 'light'; applyTheme(); await api(`/theme?theme=${store.theme}`, { method: 'POST' }); };
}
function render404() { view.innerHTML = `<div class="card card-soft p-5 text-center"><h1>404</h1><a href="#/dashboard" class="btn btn-primary">На главную</a></div>`; }
function applyTheme() { document.documentElement.setAttribute('data-bs-theme', store.theme); themeBtn.textContent = store.theme === 'dark' ? '☀️' : '🌙'; }
themeBtn.onclick = async () => { store.theme = store.theme === 'dark' ? 'light' : 'dark'; applyTheme(); await api(`/theme?theme=${store.theme}`, { method: 'POST' }); };
window.addEventListener('hashchange', route);
bootstrap();


window.logout = () => {
  store.isAuth = false;
  localStorage.removeItem('isAuth');
  location.hash = '/login';
};

const store = {
  theme: localStorage.getItem('theme') || 'light',
  user: JSON.parse(localStorage.getItem('user') || '{"name":"Alex","email":"alex@mail.com"}'),
  tasks: JSON.parse(localStorage.getItem('tasks') || '[]')
};
const save = () => { localStorage.setItem('tasks', JSON.stringify(store.tasks)); localStorage.setItem('theme', store.theme); localStorage.setItem('user', JSON.stringify(store.user)); };
const view = document.getElementById('view');

function route(){
  const path = location.hash.replace('#','') || '/login';
  if(path==='/login') return renderLogin();
  if(path==='/register') return renderRegister();
  if(path==='/dashboard') return renderDashboard();
  if(path==='/tasks') return renderTasks();
  if(path==='/profile') return renderProfile();
  if(path==='/settings') return renderSettings();
  return render404();
}

function renderLogin(){view.innerHTML=`<div class="row justify-content-center"><div class="col-12 col-md-5"><div class="card card-soft p-4"><h3>Вход</h3><form id="loginForm" class="d-grid gap-2"><input type="email" class="form-control" required placeholder="Email"><input type="password" class="form-control" required minlength="6" placeholder="Пароль"><button class="btn btn-primary">Войти</button></form><button class="btn btn-outline-danger mt-2">Google (mock)</button><a href="#/register" class="mt-3 d-inline-block">Регистрация</a></div></div></div>`;
  document.getElementById('loginForm').onsubmit=e=>{e.preventDefault();location.hash='/dashboard'};
}
function renderRegister(){view.innerHTML=`<div class="row justify-content-center"><div class="col-12 col-md-5"><div class="card card-soft p-4"><h3>Регистрация</h3><form id="regForm" class="d-grid gap-2"><input class="form-control" required placeholder="Имя"><input type="email" class="form-control" required placeholder="Email"><input type="password" id="p1" class="form-control" required placeholder="Пароль"><input type="password" id="p2" class="form-control" required placeholder="Повтор пароля"><button class="btn btn-primary">Создать</button></form><a href="#/login" class="mt-3 d-inline-block">На вход</a></div></div></div>`;
  document.getElementById('regForm').onsubmit=e=>{e.preventDefault(); if(p1.value!==p2.value) return alert('Пароли не совпадают'); location.hash='/login'; };
}
function renderDashboard(){
  const total=store.tasks.length, done=store.tasks.filter(t=>t.status==='done').length, overdue=store.tasks.filter(t=>t.status==='overdue').length, progress=store.tasks.filter(t=>t.status==='in_progress').length;
  view.innerHTML=`<div class="row g-3">${[['Всего задач',total],['Выполнено',done],['Просрочено',overdue],['В процессе',progress]].map(s=>`<div class="col-6 col-xl-3"><div class="card card-soft p-3"><small class="text-secondary">${s[0]}</small><div class="display-6">${s[1]}</div></div></div>`).join('')}<div class="col-12"><div class="card card-soft p-3">Ближайшие задачи, выполненные задачи и график продуктивности (mock).</div></div></div><button class="btn btn-primary fab" onclick="location.hash='/tasks'">+</button>`;
}
function renderTasks(){
  view.innerHTML=`<div class="card card-soft p-3 mb-3"><form id="taskForm" class="row g-2"><div class="col-12 col-md-3"><input class="form-control" id="title" required placeholder="Название"></div><div class="col-6 col-md-2"><input class="form-control" id="deadline" type="date" required></div><div class="col-6 col-md-2"><select id="priority" class="form-select"><option>low</option><option selected>medium</option><option>high</option></select></div><div class="col-12 col-md-2"><input class="form-control" id="category" placeholder="Категория"></div><div class="col-12 col-md-3"><button class="btn btn-primary w-100">Добавить</button></div><div class="col-12"><textarea id="desc" class="form-control" placeholder="Описание"></textarea></div></form></div>
  <div class="row g-2 mb-3"><div class="col-12 col-md-4"><input id="q" class="form-control" placeholder="Поиск"></div><div class="col-6 col-md-3"><select id="fStatus" class="form-select"><option value="">Статус: все</option><option>todo</option><option>in_progress</option><option>done</option><option>overdue</option></select></div><div class="col-6 col-md-3"><select id="fPriority" class="form-select"><option value="">Приоритет: все</option><option>low</option><option>medium</option><option>high</option></select></div></div>
  <div id="taskList" class="row g-3"></div>
  <div class="card card-soft p-3 mt-3"><b>Голосовой помощник (mock)</b><div class="mt-2 d-flex gap-2"><button class="btn btn-danger" id="mic">🎙️</button><input class="form-control" id="voiceText" placeholder="Скажи: создай задачу..."/><button class="btn btn-outline-primary" id="voiceSend">Отправить</button></div><div class="small text-secondary mt-2" id="voiceResp">Ожидание команды...</div></div>`;
  const renderList=()=>{
    const q=document.getElementById('q')?.value?.toLowerCase()||''; const fs=document.getElementById('fStatus')?.value||''; const fp=document.getElementById('fPriority')?.value||'';
    let list=store.tasks.filter(t=>(t.title+t.description).toLowerCase().includes(q)); if(fs) list=list.filter(t=>t.status===fs); if(fp) list=list.filter(t=>t.priority===fp);
    document.getElementById('taskList').innerHTML = list.length? list.map(t=>`<div class="col-12 col-lg-6"><div class="card card-soft p-3"><div class="d-flex justify-content-between"><h5>${t.title}</h5><button class="btn btn-sm btn-outline-danger" onclick="delTask('${t.id}')">Удалить</button></div><p>${t.description||''}</p><div class="d-flex gap-2 flex-wrap"><span class="badge text-bg-secondary">${t.category||'General'}</span><span class="badge text-bg-info">${t.priority}</span><span class="badge text-bg-dark">${t.deadline}</span><select class="form-select form-select-sm w-auto" onchange="setStatus('${t.id}',this.value)"><option ${t.status==='todo'?'selected':''}>todo</option><option ${t.status==='in_progress'?'selected':''}>in_progress</option><option ${t.status==='done'?'selected':''}>done</option><option ${t.status==='overdue'?'selected':''}>overdue</option></select></div></div></div>`).join('') : '<div class="col-12"><div class="card card-soft p-3">Пусто: задач нет</div></div>';
  };
  ['q','fStatus','fPriority'].forEach(id=>document.getElementById(id).oninput=renderList);
  taskForm.onsubmit=e=>{e.preventDefault(); store.tasks.unshift({id:crypto.randomUUID(), title:title.value, description:desc.value, deadline:deadline.value, priority:priority.value, category:category.value, status:'todo'}); save(); taskForm.reset(); renderList(); };
  mic.onclick=()=>{voiceText.value='Создай задачу закончить проект завтра'; voiceResp.innerText='Запись...'; setTimeout(()=>voiceResp.innerText='Задача успешно создана (mock)',700)};
  voiceSend.onclick=()=>voiceResp.innerText='Задача успешно создана (mock)';
  renderList();
}
window.delTask=id=>{store.tasks=store.tasks.filter(t=>t.id!==id); save(); renderTasks();}
window.setStatus=(id,status)=>{const t=store.tasks.find(x=>x.id===id); if(t){t.status=status; save();}}
function renderProfile(){view.innerHTML=`<div class="card card-soft p-4"><div class="d-flex align-items-center gap-3"><div class="rounded-circle bg-primary" style="width:72px;height:72px"></div><div><h4>${store.user.name}</h4><p class="mb-0">${store.user.email}</p></div></div><hr><p>Продуктивность: ${store.tasks.filter(t=>t.status==='done').length}/${store.tasks.length||0}</p><button class="btn btn-outline-danger" onclick="location.hash='/login'">Logout</button></div>`;}
function renderSettings(){view.innerHTML=`<div class="card card-soft p-4"><h4>Настройки</h4><div class="form-check form-switch my-3"><input class="form-check-input" type="checkbox" id="t" ${store.theme==='dark'?'checked':''}><label class="form-check-label" for="t">Тёмная тема</label></div><div class="mb-3"><label class="form-label">Язык</label><select class="form-select"><option selected>Русский</option><option>English</option></select></div><div class="mb-3"><label class="form-label">Уведомления</label><select class="form-select"><option>Включены</option><option>Выключены</option></select></div><div><label class="form-label">Голосовой ассистент</label><select class="form-select"><option>Стандартный</option><option>Минимальный</option></select></div></div>`; document.getElementById('t').onchange=(e)=>{store.theme=e.target.checked?'dark':'light'; applyTheme(); save();};}
function render404(){view.innerHTML=`<div class="card card-soft p-5 text-center"><h1>404</h1><a href="#/dashboard" class="btn btn-primary">На главную</a></div>`}
function applyTheme(){document.documentElement.setAttribute('data-bs-theme',store.theme); themeBtn.textContent=store.theme==='dark'?'☀️':'🌙';}
themeBtn.onclick=()=>{store.theme=store.theme==='dark'?'light':'dark'; applyTheme(); save();};
applyTheme();
window.addEventListener('hashchange', route);
route();

