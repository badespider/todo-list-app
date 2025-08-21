export type TaskStatus = 'open' | 'completed';

export interface Task {
  id: string;
  title: string;
  notes?: string;
  status: TaskStatus;
  dueDate?: string; // ISO date
  priority: 0 | 1 | 2 | 3;
  tags: string[];
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}

