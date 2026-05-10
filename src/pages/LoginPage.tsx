import { Link, useNavigate } from 'react-router-dom';
import { AuthCard } from '../components/AuthCard';
import { useAppStore } from '../store/useAppStore';

export const LoginPage = () => {
  const nav = useNavigate();
  const login = useAppStore((s) => s.login);
  return <AuthCard title="Вход">
    <form className="space-y-3" onSubmit={(e) => {e.preventDefault(); login('User', 'user@mail.com'); nav('/dashboard');}}>
      <input required type="email" placeholder="Email" className="input"/>
      <input required minLength={6} type="password" placeholder="Пароль" className="input"/>
      <button className="btn-primary w-full">Войти</button>
    </form>
    <button className="btn-secondary mt-3 w-full">Войти через Google</button>
    <p className="mt-4 text-sm">Нет аккаунта? <Link className="text-indigo-500" to="/register">Регистрация</Link></p>
  </AuthCard>;
};
