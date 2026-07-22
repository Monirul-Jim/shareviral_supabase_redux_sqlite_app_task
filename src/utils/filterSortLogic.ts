import { Task } from '../types/task';

interface FilterSortOptions {
  categoryId: string | null;
  status: 'all' | 'open' | 'done';
  sortBy: 'due_date' | 'created_at';
  searchQuery: string;
}

export function applyFilterAndSort(tasks: Task[], options: FilterSortOptions): Task[] {
  let result = [...tasks];

  if (options.categoryId) {
    result = result.filter(t => t.category_id === options.categoryId);
  }

  if (options.status !== 'all') {
    result = result.filter(t => t.status === options.status);
  }

  if (options.searchQuery) {
    const lowerQuery = options.searchQuery.toLowerCase();
    result = result.filter(t => t.title.toLowerCase().includes(lowerQuery));
  }

  result.sort((a, b) => {
    if (options.sortBy === 'due_date') {
      const dateA = a.due_date ? new Date(a.due_date).getTime() : Infinity;
      const dateB = b.due_date ? new Date(b.due_date).getTime() : Infinity;
      return dateA - dateB;
    } else {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return dateB - dateA; // Descending
    }
  });

  return result;
}
