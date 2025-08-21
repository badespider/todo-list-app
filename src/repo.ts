import { db } from './db';
import type { Task, TaskStatus } from './types';
import { v4 as uuidv4 } from 'uuid';

const now = () => new Date().toISOString();

export async function listTasks(filter?: { status?: TaskStatus; tag?: string; search?: string }) {
  let collection = db.table('tasks').toCollection();

  if (filter?.status) {
    collection = db.table('tasks').where('status').equals(filter.status);
  }

  const tasks = await collection.sortBy('updatedAt');
  let result = tasks.reverse();

  if (filter?.tag) {
    result = result.filter(t => t.tags?.includes(filter.tag!));
  }
  if (filter?.search) {
    const q = filter.search.toLowerCase();
    result = result.filter(t =>
      t.title.toLowerCase().includes(q) || (t.notes?.toLowerCase().includes(q) ?? false) || t.tags.some((tag: string) => tag.toLowerCase().includes(q))
    );
  }

  return result;
}

export async function getTask(id: string) {
  return db.table('tasks').get(id);
}

export async function addTask(input: { title: string; notes?: string; dueDate?: string; priority?: 0 | 1 | 2 | 3; tags?: string[] }) {
  const task: Task = {
    id: uuidv4(),
    title: input.title.trim(),
    notes: input.notes?.trim(),
    status: 'open',
    dueDate: input.dueDate,
    priority: input.priority ?? 1,
    tags: input.tags ?? [],
    createdAt: now(),
    updatedAt: now(),
  };
  await db.table('tasks').add(task);
  return task;
}

export async function updateTask(id: string, patch: Partial<Omit<Task, 'id' | 'createdAt'>>) {
  const current = await getTask(id);
  if (!current) return undefined;
  const updated: Task = { ...current, ...patch, updatedAt: now() };
  await db.table('tasks').put(updated);
  return updated;
}

export async function toggleTask(id: string) {
  const t = await getTask(id);
  if (!t) return undefined;
  const status: TaskStatus = t.status === 'open' ? 'completed' : 'open';
  return updateTask(id, { status });
}

export async function deleteTask(id: string) {
  await db.table('tasks').delete(id);
}

