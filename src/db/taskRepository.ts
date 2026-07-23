import { db } from './sqlite';
import { Task, Category } from '../types/task';

// --- Categories ---

export const getLocalCategories = async (): Promise<Category[]> => {
  const result = await db.getAllAsync<Category>('SELECT * FROM categories');
  return result;
};

export const upsertLocalCategories = async (categories: Category[]) => {
  for (const cat of categories) {
    await db.runAsync(
      `INSERT OR REPLACE INTO categories (id, name, color, created_at)
       VALUES (?, ?, ?, ?)`,
      [cat.id, cat.name, cat.color, cat.created_at]
    );
  }
};

export const updateLocalCategory = async (id: string, name: string) => {
  await db.runAsync('UPDATE categories SET name = ? WHERE id = ?', [name, id]);
};

export const deleteLocalCategory = async (id: string) => {
  await db.runAsync('DELETE FROM categories WHERE id = ?', [id]);
};

// --- Tasks ---

export const getLocalTasks = async (): Promise<Task[]> => {
  const rows = await db.getAllAsync<any>('SELECT * FROM tasks');
  return rows.map((row) => ({
    ...row,
    is_starred: row.is_starred === 1,
  }));
};

export const getLocalTaskById = async (id: string): Promise<Task | null> => {
  const row = await db.getFirstAsync<any>('SELECT * FROM tasks WHERE id = ?', [id]);
  if (!row) return null;
  return {
    ...row,
    is_starred: row.is_starred === 1,
  };
};

export const upsertLocalTasks = async (tasks: Task[]) => {
  for (const task of tasks) {
    await db.runAsync(
      `INSERT OR REPLACE INTO tasks 
      (id, title, description, category_id, status, due_date, created_at, updated_at, is_starred)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        task.id,
        task.title,
        task.description ?? null,
        task.category_id ?? null,
        task.status,
        task.due_date ?? null,
        task.created_at,
        task.updated_at,
        task.is_starred ? 1 : 0,
      ]
    );
  }
};

export const upsertLocalTask = async (task: Task) => {
  await upsertLocalTasks([task]);
};

export const deleteLocalTask = async (id: string) => {
  await db.runAsync('DELETE FROM tasks WHERE id = ?', [id]);
};

export const setLocalTaskStarred = async (id: string, isStarred: boolean) => {
  await db.runAsync('UPDATE tasks SET is_starred = ? WHERE id = ?', [
    isStarred ? 1 : 0,
    id,
  ]);
};

export const clearLocalTasks = async () => {
    await db.runAsync('DELETE FROM tasks');
}
