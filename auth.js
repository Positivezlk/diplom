const API = '/api';
let registerMode = false;

async function api(path, options = {}) {
  const r = await fetch(`${API}${path}`, { headers: { 'Content-Type': 'application/json' }, ...options });
  if (!r.ok) throw new Error((await r.json()).detail || 'API error');
  return r.json();
}

if (localStorage.getItem('isAuth') === '1') {

  location.replace('/app#/dashboard');


  location.replace('/app#/dashboard');


  location.replace('/app#/dashboard');

  location.replace('/#/dashboard');



}

const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const switchMode = document.getElementById('switchMode');
const authTitle = document.getElementById('authTitle');

const loginEmail = document.getElementById('loginEmail');
const loginPassword = document.getElementById('loginPassword');
const regName = document.getElementById('regName');
const regEmail = document.getElementById('regEmail');
const regPassword = document.getElementById('regPassword');
const regConfirm = document.getElementById('regConfirm');

switchMode.addEventListener('click', () => {



switchMode.onclick = () => {


  registerMode = !registerMode;
  loginForm.classList.toggle('d-none', registerMode);
  registerForm.classList.toggle('d-none', !registerMode);
  authTitle.textContent = registerMode ? 'Регистрация' : 'Вход';
  switchMode.textContent = registerMode ? 'Уже есть аккаунт? Войти' : 'Нет аккаунта? Регистрация';



});

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    await api('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: loginEmail.value, password: loginPassword.value }),
    });
    localStorage.setItem('isAuth', '1');
    location.replace('/app#/dashboard');
  } catch (err) {
    alert(err.message);
  }
});

registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    await api('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: regName.value,
        email: regEmail.value,
        password: regPassword.value,
        confirm_password: regConfirm.value,
      }),
    });
    localStorage.setItem('isAuth', '1');
    location.replace('/app#/dashboard');
  } catch (err) {
    alert(err.message);
  }
});


};

loginForm.onsubmit = async (e) => {
  e.preventDefault();
  try {
    await api('/auth/login', { method: 'POST', body: JSON.stringify({ email: loginEmail.value, password: loginPassword.value }) });
    localStorage.setItem('isAuth', '1');

    location.replace('/app#/dashboard');

    location.replace('/#/dashboard');

  } catch (err) { alert(err.message); }
};

registerForm.onsubmit = async (e) => {
  e.preventDefault();
  try {
    await api('/auth/register', { method: 'POST', body: JSON.stringify({ name: regName.value, email: regEmail.value, password: regPassword.value, confirm_password: regConfirm.value }) });
    localStorage.setItem('isAuth', '1');

    location.replace('/app#/dashboard');

    location.replace('/#/dashboard');

  } catch (err) { alert(err.message); }
};


