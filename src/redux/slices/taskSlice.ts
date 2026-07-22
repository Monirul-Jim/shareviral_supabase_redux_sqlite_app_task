import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '../../services/supabaseClient';
import {
  getLocalTasks,
  upsertLocalTasks,
  upsertLocalTask,
  deleteLocalTask,
  setLocalTaskStarred,
} from '../../db/taskRepository';
import { Task } from '../../types/task';
import { mergeRemoteWithLocalStarred } from '../../utils/mergeTaskData';

interface TaskState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  lastRefreshed: string | null;
  isRefreshing: boolean;
}

const initialState: TaskState = {
  tasks: [],
  loading: false,
  error: null,
  lastRefreshed: null,
  isRefreshing: false,
};

export const fetchLocalTasks = createAsyncThunk(
  'tasks/fetchLocal',
  async () => {
    return await getLocalTasks();
  }
);

export const syncTasks = createAsyncThunk(
  'tasks/sync',
  async (_, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase.from('tasks').select('*');
      if (error) throw error;

      const remoteTasks = data as Task[];
      const localTasks = await getLocalTasks();
      
      const mergedTasks = mergeRemoteWithLocalStarred(remoteTasks, localTasks);
      
      await upsertLocalTasks(mergedTasks);
      return mergedTasks;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const addTask = createAsyncThunk(
  'tasks/add',
  async (task: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'is_starred'>, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase.from('tasks').insert([task]).select().single();
      if (error) throw error;
      
      const newTask = { ...data, is_starred: false } as Task;
      await upsertLocalTask(newTask);
      return newTask;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateTask = createAsyncThunk(
  'tasks/update',
  async (task: Partial<Task> & { id: string }, { getState, rejectWithValue }) => {
    try {
      const { id, is_starred, ...updates } = task;
      const { data, error } = await supabase
        .from('tasks')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      
      const state = getState() as any;
      const existingTask = state.tasks.tasks.find((t: Task) => t.id === id);
      const isStarred = is_starred !== undefined ? is_starred : (existingTask?.is_starred ?? false);

      const updatedTask = { ...data, is_starred: isStarred } as Task;
      await upsertLocalTask(updatedTask);
      return updatedTask;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const toggleTaskComplete = createAsyncThunk(
  'tasks/toggleComplete',
  async ({ id, status }: { id: string, status: 'open' | 'done' }, { dispatch }) => {
      return dispatch(updateTask({ id, status })).unwrap();
  }
);

export const deleteTask = createAsyncThunk(
  'tasks/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      const { error } = await supabase.from('tasks').delete().eq('id', id);
      if (error) throw error;
      
      await deleteLocalTask(id);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const toggleTaskStarLocal = createAsyncThunk(
  'tasks/toggleStarLocal',
  async ({ id, isStarred }: { id: string; isStarred: boolean }, { rejectWithValue }) => {
    try {
      await setLocalTaskStarred(id, isStarred);
      return { id, isStarred };
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Local fetch
      .addCase(fetchLocalTasks.fulfilled, (state, action) => {
        state.tasks = action.payload;
      })
      // Sync
      .addCase(syncTasks.pending, (state) => {
        state.isRefreshing = true;
        state.error = null;
      })
      .addCase(syncTasks.fulfilled, (state, action) => {
        state.tasks = action.payload;
        state.isRefreshing = false;
        state.lastRefreshed = new Date().toISOString();
      })
      .addCase(syncTasks.rejected, (state, action) => {
        state.isRefreshing = false;
        state.error = action.payload as string;
      })
      // Add
      .addCase(addTask.fulfilled, (state, action) => {
        state.tasks.push(action.payload);
      })
      // Update
      .addCase(updateTask.fulfilled, (state, action) => {
        const index = state.tasks.findIndex((t) => t.id === action.payload.id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
      })
      // Delete
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.tasks = state.tasks.filter((t) => t.id !== action.payload);
      })
      // Toggle Star
      .addCase(toggleTaskStarLocal.fulfilled, (state, action) => {
        const index = state.tasks.findIndex((t) => t.id === action.payload.id);
        if (index !== -1) {
          state.tasks[index].is_starred = action.payload.isStarred;
        }
      });
  },
});

export default taskSlice.reducer;
