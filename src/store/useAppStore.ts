import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Task, TaskStatus } from '../types';

interface AppState {
  theme: 'light' | 'dark';
  user: { name: string; email: string } | null;
  tasks: Task[];
  setTheme: (theme: 'light' | 'dark') => void;
  login: (name: string, email: string) => void;
  logout: () => void;
  addTask: (task: Omit<Task, 'id'>) => void;
  updateTask: (id: string, patch: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  setStatus: (id: string, status: TaskStatus) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      theme: 'light',
      user: { name: 'Alex', email: 'alex@mail.com' },
      tasks: [],
      setTheme: (theme) => set({ theme }),
      login: (name, email) => set({ user: { name, email } }),
      logout: () => set({ user: null }),
      addTask: (task) => set((s) => ({ tasks: [{ ...task, id: crypto.randomUUID() }, ...s.tasks] })),
      updateTask: (id, patch) => set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)) })),
      deleteTask: (id) => set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),
      setStatus: (id, status) => set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, status } : t)) })),
    }),
    { name: 'smart-task-store' },
  ),
);
