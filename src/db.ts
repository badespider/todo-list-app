import Dexie from 'dexie';
import type { Table } from 'dexie';
import type { Task } from './types';

export class TasksDB extends Dexie {
  tasks!: Table<Task, string>;

  constructor() {
    super('todo_list_db');
    this.version(1).stores({
      // id is primary key, plus indexes on status and dueDate
      tasks: 'id, status, dueDate, updatedAt',
    });
  }
}

export const db = new TasksDB();

