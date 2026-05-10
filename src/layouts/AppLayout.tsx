import { Link, NavLink, Outlet } from 'react-router-dom';
import { Settings, User, LayoutDashboard, ListTodo } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export const AppLayout = () => {
  const { theme, setTheme } = useAppStore();
  return (
    <div className={theme === 'dark' ? 'dark min-h-screen bg-slate-950' : 'min-h-screen bg-slate-100'}>
      <div className="mx-auto grid min-h-screen max-w-7xl grid-cols-1 md:grid-cols-[260px_1fr] gap-4 p-4">
        <aside className="card hidden md:block">
          <Link to="/dashboard" className="mb-5 block text-xl font-bold">Smart Tasks</Link>
          <nav className="space-y-2">
            {[
              ['/dashboard', 'Dashboard', <LayoutDashboard size={16}/>],
              ['/tasks', 'Tasks', <ListTodo size={16}/>],
              ['/profile', 'Profile', <User size={16}/>],
              ['/settings', 'Settings', <Settings size={16}/>],
            ].map(([to, label, icon]) => (
              <NavLink key={String(to)} to={String(to)} className="flex items-center gap-2 rounded-xl px-3 py-2 hover:bg-indigo-100 dark:hover:bg-slate-800">{icon}{label}</NavLink>
            ))}
          </nav>
        </aside>
        <main className="space-y-4">
          <div className="card flex items-center justify-between">
            <h1 className="text-lg font-semibold">Умный task-менеджер</h1>
            <button className="btn-secondary" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>{theme === 'dark' ? '☀️' : '🌙'}</button>
          </div>
          <Outlet />
        </main>
      </div>
    </div>
  );
};
