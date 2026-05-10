import { useAppStore } from '../store/useAppStore';

export const ProfilePage = () => {
  const { user, logout } = useAppStore();
  return <div className="card space-y-2"><div className="h-16 w-16 rounded-full bg-indigo-300"/><h2 className="text-xl font-bold">{user?.name ?? 'Гость'}</h2><p>{user?.email}</p><p>Статистика продуктивности (mock)</p><button className="btn-secondary" onClick={logout}>Logout</button></div>;
};
