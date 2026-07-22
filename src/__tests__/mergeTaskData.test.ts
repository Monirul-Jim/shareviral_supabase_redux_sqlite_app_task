import { mergeRemoteWithLocalStarred } from '../utils/mergeTaskData';
import { Task } from '../types/task';

describe('mergeRemoteWithLocalStarred', () => {
  it('should preserve local is_starred flags when merging with remote data', () => {
    const remoteTasks: Task[] = [
      { id: '1', title: 'Task 1', status: 'open', created_at: '', updated_at: '', description: null, category_id: null, due_date: null },
      { id: '2', title: 'Task 2', status: 'open', created_at: '', updated_at: '', description: null, category_id: null, due_date: null },
      { id: '3', title: 'Task 3', status: 'open', created_at: '', updated_at: '', description: null, category_id: null, due_date: null },
    ];

    const localTasks: Task[] = [
      { id: '1', title: 'Task 1', status: 'open', created_at: '', updated_at: '', is_starred: true, description: null, category_id: null, due_date: null },
      { id: '2', title: 'Task 2', status: 'open', created_at: '', updated_at: '', is_starred: false, description: null, category_id: null, due_date: null },
    ];

    const merged = mergeRemoteWithLocalStarred(remoteTasks, localTasks);

    expect(merged.find(t => t.id === '1')?.is_starred).toBe(true);
    expect(merged.find(t => t.id === '2')?.is_starred).toBe(false);
    expect(merged.find(t => t.id === '3')?.is_starred).toBe(false); 
  });
});
