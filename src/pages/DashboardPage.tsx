import { useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';

export const DashboardPage = () => {
  const tasks = useAppStore((s) => s.tasks);
  const stats = useMemo(() => ({
    total: tasks.length,
    done: tasks.filter((t) => t.status === 'done').length,
    overdue: tasks.filter((t) => t.status === 'overdue').length,
    progress: tasks.filter((t) => t.status === 'in_progress').length,
  }), [tasks]);
  return <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
    {Object.entries(stats).map(([k,v]) => <div key={k} className="card"><p className="text-sm opacity-70">{k}</p><p className="text-3xl font-bold">{v}</p></div>)}
    <div className="card md:col-span-2 xl:col-span-4">График продуктивности (mock), быстрые действия, ближайшие и выполненные задачи.</div>
  </div>;
};
