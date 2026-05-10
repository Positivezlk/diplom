export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'overdue';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description: string;
  deadline: string;
  priority: TaskPriority;
  category: string;
  status: TaskStatus;
}
