import { Link, useNavigate } from 'react-router-dom';
import { AuthCard } from '../components/AuthCard';

export const RegisterPage = () => {
  const nav = useNavigate();
  return <AuthCard title="Регистрация">
    <form className="space-y-3" onSubmit={(e) => {e.preventDefault(); nav('/login');}}>
      <input required placeholder="Имя" className="input"/>
      <input required type="email" placeholder="Email" className="input"/>
      <input required minLength={6} type="password" placeholder="Пароль" className="input"/>
      <input required minLength={6} type="password" placeholder="Подтверждение пароля" className="input"/>
      <button className="btn-primary w-full">Создать аккаунт</button>
    </form>
    <p className="mt-4 text-sm">Есть аккаунт? <Link className="text-indigo-500" to="/login">Войти</Link></p>
  </AuthCard>;
};
