export interface Category {
  id: string;
  name: string;
  color: string;
  created_at: string;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  category_id: string | null;
  status: 'open' | 'done';
  due_date: string | null;
  created_at: string;
  updated_at: string;
  is_starred?: boolean;
}
