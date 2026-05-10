import { useState } from 'react';
import { useAppStore } from '../store/useAppStore';

export const TasksPage = () => {
  const { tasks, addTask, deleteTask, setStatus } = useAppStore();
  const [title, setTitle] = useState('');
  const [query, setQuery] = useState('');
  const filtered = tasks.filter((t) => [t.title, t.description].join(' ').toLowerCase().includes(query.toLowerCase()));
  return <div className="space-y-4">
    <div className="card">
      <div className="grid gap-2 md:grid-cols-3">
        <input className="input" value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="Название задачи"/>
        <input className="input" value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Поиск"/>
        <button className="btn-primary" onClick={()=>{ if(!title) return; addTask({title, description:'', deadline:new Date().toISOString().slice(0,10), priority:'medium', category:'General', status:'todo'}); setTitle('');}}>Добавить</button>
      </div>
    </div>
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {filtered.length === 0 && <div className="card">Empty state: задач пока нет.</div>}
      {filtered.map((t) => <div key={t.id} className="card space-y-2"><h3 className="font-semibold">{t.title}</h3><p className="text-xs">{t.status}</p><div className="flex gap-2"><button className="btn-secondary" onClick={()=>setStatus(t.id, t.status === 'done' ? 'todo' : 'done')}>Toggle status</button><button className="btn-secondary" onClick={()=>deleteTask(t.id)}>Удалить</button></div></div>)}
    </div>
    <div className="card">Голосовой помощник (mock): 🎙️ «Создай задачу...» → «Задача успешно создана».</div>
  </div>;
};
