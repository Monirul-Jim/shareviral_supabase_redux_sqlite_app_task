import { applyFilterAndSort } from '../utils/filterSortLogic';
import { Task } from '../types/task';

describe('applyFilterAndSort', () => {
  const dummyTasks: Task[] = [
    { id: '1', title: 'Apple', status: 'open', category_id: 'c1', due_date: '2023-10-10', created_at: '2023-10-01', updated_at: '', description: null },
    { id: '2', title: 'Banana', status: 'done', category_id: 'c2', due_date: '2023-10-12', created_at: '2023-10-02', updated_at: '', description: null },
    { id: '3', title: 'Cherry', status: 'open', category_id: 'c1', due_date: '2023-10-08', created_at: '2023-10-03', updated_at: '', description: null },
  ];

  it('filters by status', () => {
    const result = applyFilterAndSort(dummyTasks, { categoryId: null, status: 'open', sortBy: 'created_at', searchQuery: '' });
    expect(result.length).toBe(2);
    expect(result.map(t => t.title)).toContain('Apple');
    expect(result.map(t => t.title)).toContain('Cherry');
  });

  it('filters by category', () => {
    const result = applyFilterAndSort(dummyTasks, { categoryId: 'c2', status: 'all', sortBy: 'created_at', searchQuery: '' });
    expect(result.length).toBe(1);
    expect(result[0].title).toBe('Banana');
  });

  it('searches by title', () => {
    const result = applyFilterAndSort(dummyTasks, { categoryId: null, status: 'all', sortBy: 'created_at', searchQuery: 'app' });
    expect(result.length).toBe(1);
    expect(result[0].title).toBe('Apple');
  });

  it('sorts by due_date', () => {
    const result = applyFilterAndSort(dummyTasks, { categoryId: null, status: 'all', sortBy: 'due_date', searchQuery: '' });
    // Expected order: Cherry (08), Apple (10), Banana (12)
    expect(result[0].title).toBe('Cherry');
    expect(result[1].title).toBe('Apple');
    expect(result[2].title).toBe('Banana');
  });

  it('sorts by created_at (descending)', () => {
    const result = applyFilterAndSort(dummyTasks, { categoryId: null, status: 'all', sortBy: 'created_at', searchQuery: '' });
    // Expected order (desc): Cherry (03), Banana (02), Apple (01)
    expect(result[0].title).toBe('Cherry');
    expect(result[1].title).toBe('Banana');
    expect(result[2].title).toBe('Apple');
  });
});
