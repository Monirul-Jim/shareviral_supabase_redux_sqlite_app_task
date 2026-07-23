import reducer, { fetchLocalTasks } from '../redux/slices/taskSlice';
import { Task } from '../types/task';

// Mock dependencies that throw errors without valid environment variables or native modules
jest.mock('../services/supabaseClient', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(),
      insert: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    })),
  },
}));

jest.mock('../db/taskRepository', () => ({
  getLocalTasks: jest.fn(),
  upsertLocalTasks: jest.fn(),
  upsertLocalTask: jest.fn(),
  deleteLocalTask: jest.fn(),
  setLocalTaskStarred: jest.fn(),
}));

describe('taskSlice reducer', () => {
  const initialState = {
    tasks: [],
    loading: false,
    error: null,
    lastRefreshed: null,
    isRefreshing: false,
  };

  it('should return the initial state', () => {
    expect(reducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle fetchLocalTasks.fulfilled', () => {
    const mockTasks: Task[] = [
      {
        id: '1',
        title: 'Test Task',
        status: 'open',
        category_id: 'c1',
        due_date: '2023-10-10',
        created_at: '2023-10-01',
        updated_at: '2023-10-01',
        description: null,
        is_starred: false,
      },
    ];

    const action = {
      type: fetchLocalTasks.fulfilled.type,
      payload: mockTasks,
    };

    const nextState = reducer(initialState, action);

    expect(nextState.tasks.length).toBe(1);
    expect(nextState.tasks[0].title).toBe('Test Task');
  });
});
