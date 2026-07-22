import * as SQLite from 'expo-sqlite';

export const db = SQLite.openDatabaseSync('taskmanager.db');

export const initDatabase = async () => {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      color TEXT,
      created_at TEXT
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      category_id TEXT,
      status TEXT NOT NULL DEFAULT 'open',
      due_date TEXT,
      created_at TEXT,
      updated_at TEXT,
      is_starred INTEGER DEFAULT 0
    );
  `);
};
