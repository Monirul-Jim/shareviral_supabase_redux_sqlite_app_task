# Task Manager App

A robust, offline-first task management application built with React Native (Expo), Supabase, Redux Toolkit, and Expo SQLite. This app allows users to create tasks, organize them into categories, mark them as complete, and view them seamlessly even without an internet connection.

## 🚀 Setup Instructions

1. **Clone the repository and install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Variables:**
   Create a `.env` file in the root directory and add your Supabase credentials:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Start the app:**
   ```bash
   npx expo start
   ```

## 🗄️ Backend Schema & Seed Data (Supabase)

This project uses Supabase as the backend. Since authentication is out of scope, **Row Level Security (RLS) is disabled** (or configured with a public policy) on these tables to allow anonymous read/write operations.

### Schema SQL
```sql
-- Categories Table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tasks Table
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'done')),
  due_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Seed Data SQL
```sql
-- Insert Categories
INSERT INTO categories (id, name, color) VALUES 
('c1e11a3d-4c3e-4b2a-8c43-b1d1f0c05a11', 'Work', '#4F46E5'),
('c2e22b4e-5d4f-5c3b-9d54-c2e2g1d16b22', 'Personal', '#10B981'),
('c3e33c5f-6e50-6d4c-0e65-d3f3h2e27c33', 'Shopping', '#F59E0B');

-- Insert Tasks
INSERT INTO tasks (title, description, category_id, status, due_date) VALUES 
('Complete Assessment', 'Finish the React Native task manager assessment', 'c1e11a3d-4c3e-4b2a-8c43-b1d1f0c05a11', 'open', NOW() + INTERVAL '1 day'),
('Buy Groceries', 'Milk, eggs, and bread', 'c3e33c5f-6e50-6d4c-0e65-d3f3h2e27c33', 'open', NOW() + INTERVAL '2 days'),
('Read Book', 'Read 2 chapters of the new sci-fi novel', 'c2e22b4e-5d4f-5c3b-9d54-c2e2g1d16b22', 'done', NULL),
('Schedule Dentist', 'Call Dr. Smith for an annual checkup', 'c2e22b4e-5d4f-5c3b-9d54-c2e2g1d16b22', 'open', NOW() + INTERVAL '5 days'),
('Team Meeting Prep', 'Prepare slides for Q3 review', 'c1e11a3d-4c3e-4b2a-8c43-b1d1f0c05a11', 'open', NOW() + INTERVAL '1 day'),
('Fix Bug #104', 'Resolve the crashing issue on the login screen', 'c1e11a3d-4c3e-4b2a-8c43-b1d1f0c05a11', 'done', NOW() - INTERVAL '1 day'),
('Buy Gym Shoes', 'Look for running shoes online', 'c3e33c5f-6e50-6d4c-0e65-d3f3h2e27c33', 'open', NULL),
('Call Mom', 'Catch up on the weekend', 'c2e22b4e-5d4f-5c3b-9d54-c2e2g1d16b22', 'open', NOW() + INTERVAL '3 days');
```

## 💾 Architecture Decisions

### Local Storage: `expo-sqlite`
I chose `expo-sqlite` because an offline-first task manager fundamentally requires structured, relational data. While `AsyncStorage` or `MMKV` are great for key-value pairs, SQLite allows us to maintain a proper schema, handle relational constraints (like linking tasks to categories), and enables future scalability where we might want to push complex sorting/filtering down to the database layer rather than doing it in-memory.

### State Management: Redux Toolkit
I chose Redux Toolkit (RTK) primarily for its structured approach to complex asynchronous workflows via `createAsyncThunk`. Handling an offline-first app requires orchestrating multiple steps: reading from the local SQLite cache, firing a network request to Supabase, merging the remote data with local-only fields, updating the SQLite cache, and finally updating the UI state. RTK keeps this heavy orchestration logic completely out of the React components, ensuring they remain clean and focused on rendering.

### Preserving the "Starred" State
The `is_starred` flag is a local-only field stored in SQLite and is not present in the Supabase schema. When a background refresh pulls fresh task data from the backend, a utility function (`mergeRemoteWithLocalStarred`) iterates through the incoming remote tasks. It looks up the corresponding local task by ID, and if the local task was starred (`is_starred: true`), it assigns that flag to the incoming remote task *before* upserting it back into the local SQLite cache and Redux state.

## 🧪 Testing Approach

Tests are written using Jest, focusing purely on the "load-bearing" business logic that lives outside the React render tree. I deliberately chose not to test UI components, as the core complexity of an offline-first app lies in data integrity and transformations. 
- **`filterSort.test.ts`**: Ensures that the `useFilteredTasks` logic correctly applies category/status filters and sorts by various date fields.
- **`mergeTaskData.test.ts`**: Verifies that the local-only `is_starred` flag is strictly preserved when incoming remote data attempts to overwrite the local cache.

## ⚠️ Known Limitations

- **No Offline Writes:** As per the project scope, mutations (create, edit, delete) require an active internet connection. If the network fails, an error is shown and the cache is left untouched. There is no offline write queue.
- **In-Memory Filtering:** Currently, filtering and sorting are handled in-memory via hooks after all tasks are loaded from SQLite. For very large datasets, this could become a bottleneck.
- **No Conflict Resolution:** There is no versioning or conflict resolution strategy if the same task is edited simultaneously on multiple devices.

## 🕰️ What I Would Do Differently With Another Day

1. **Implement an Offline Write Queue:** I would create a `pending_mutations` table in SQLite to capture offline writes (POST/PUT/DELETE). A background worker would sequentially replay these mutations against Supabase when connectivity is restored, providing a true offline-first editing experience.
2. **Push Filtering to SQLite:** Instead of loading all tasks into Redux and filtering via hooks, I would refactor the architecture to dynamically query SQLite based on the active filters, drastically improving performance for large datasets.
3. **Optimistic Updates with Rollback:** I would implement optimistic UI updates for mutations, instantly updating Redux/SQLite, and rolling back if the Supabase request fails, making the app feel significantly snappier.
4. **Enhanced Animations:** Add Reanimated Layout animations for list reordering, so tasks fluidly slide into their new positions when marked as done or when sort orders change.
