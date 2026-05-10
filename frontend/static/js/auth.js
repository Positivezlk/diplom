const API = '/api';
let isRegister = false;

if (localStorage.getItem('isAuth') === '1') location.replace('/app#/dashboard');

const form = document.getElementById('authForm');
const title = document.getElementById('title');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const confirmInput = document.getElementById('confirm');
const submitBtn = document.getElementById('submitBtn');
const toggle = document.getElementById('toggleRegister');

async function api(path, body) {
  const res = await fetch(`${API}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error((await res.json()).detail || 'Ошибка');
  return res.json();
}

toggle.addEventListener('click', () => {
  isRegister = !isRegister;
  title.textContent = isRegister ? 'Регистрация' : 'Вход';
  submitBtn.textContent = isRegister ? 'Зарегистрироваться' : 'Войти';
  toggle.textContent = isRegister ? 'Уже есть аккаунт? Вход' : 'Регистрация';
  nameInput.classList.toggle('d-none', !isRegister);
  confirmInput.classList.toggle('d-none', !isRegister);
  nameInput.required = isRegister;
  confirmInput.required = isRegister;
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    if (isRegister) {
      await api('/auth/register', {
        name: nameInput.value,
        email: emailInput.value,
        password: passwordInput.value,
        confirm_password: confirmInput.value,
      });
    } else {
      await api('/auth/login', { email: emailInput.value, password: passwordInput.value });
    }
    localStorage.setItem('isAuth', '1');
    location.replace('/app#/dashboard');
  } catch (err) {
    alert(err.message);
  }
});
