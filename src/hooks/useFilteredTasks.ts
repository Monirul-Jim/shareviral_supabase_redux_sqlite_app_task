import { useMemo, useState, useEffect } from 'react';
import { Task } from '../types/task';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { applyFilterAndSort } from '../utils/filterSortLogic';

interface FilterSortOptions {
  categoryId: string | null;
  status: 'all' | 'open' | 'done';
  sortBy: 'due_date' | 'created_at';
  searchQuery: string;
}

export const useFilteredTasks = (options: FilterSortOptions) => {
  // @ts-ignore - store types may need update
  const { tasks, loading, error, isRefreshing, lastRefreshed } = useSelector((state: RootState) => state.tasks);
  const [debouncedSearch, setDebouncedSearch] = useState(options.searchQuery);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(options.searchQuery);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [options.searchQuery]);

  const filteredTasks = useMemo(() => {
    return applyFilterAndSort(tasks as Task[], {
      ...options,
      searchQuery: debouncedSearch
    });
  }, [tasks, options.categoryId, options.status, options.sortBy, debouncedSearch]);

  return { filteredTasks, loading, error, isRefreshing, lastRefreshed };
};
