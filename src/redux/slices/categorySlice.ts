import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '../../services/supabaseClient';
import { getLocalCategories, upsertLocalCategories } from '../../db/taskRepository';
import { Category } from '../../types/task';

interface CategoryState {
  categories: Category[];
  loading: boolean;
  error: string | null;
}

const initialState: CategoryState = {
  categories: [],
  loading: false,
  error: null,
};

export const fetchLocalCategories = createAsyncThunk(
  'categories/fetchLocal',
  async () => {
    return await getLocalCategories();
  }
);

export const syncCategories = createAsyncThunk(
  'categories/sync',
  async (_, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase.from('categories').select('*');
      if (error) throw error;
      
      const remoteCategories = data as Category[];
      await upsertLocalCategories(remoteCategories);
      
      return remoteCategories;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const addCategory = createAsyncThunk(
  'categories/add',
  async (category: Omit<Category, 'id' | 'created_at'>, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase.from('categories').insert([category]).select().single();
      if (error) throw error;
      
      const newCategory = data as Category;
      await upsertLocalCategories([newCategory]);
      return newCategory;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

const categorySlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLocalCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
      })
      .addCase(syncCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(syncCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
        state.loading = false;
      })
      .addCase(syncCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(addCategory.fulfilled, (state, action) => {
        state.categories.push(action.payload);
      });
  },
});

export default categorySlice.reducer;
