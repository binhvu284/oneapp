# Supabase Setup Guide

## Prerequisites

1. A Supabase account (sign up at https://supabase.com)
2. A new Supabase project created

## Setup Steps

### 1. Create Supabase Project

1. Go to https://supabase.com
2. Click "New Project"
3. Fill in project details:
   - Name: OneApp
   - Database Password: (choose a strong password)
   - Region: (choose closest to you)
4. Wait for project to be created

### 2. Get Connection Details

1. Go to Project Settings > API
2. Copy the following:
   - Project URL (for `SUPABASE_URL`)
   - `anon` `public` key (for `SUPABASE_ANON_KEY`)
   - `service_role` `secret` key (for `SUPABASE_KEY` - keep this secret!)

3. Go to Project Settings > Database
4. Copy the Connection String (for `DATABASE_URL`)

### 3. Run Database Schema

1. Go to SQL Editor in Supabase Dashboard
2. Open `database/schema.sql`
3. Copy the entire contents
4. Paste into SQL Editor
5. Click "Run" to execute

### 4. Configure Environment Variables

Update `backend/.env` with your Supabase credentials:

```env
SUPABASE_URL=your-project-url
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_KEY=your-service-role-key
DATABASE_URL=your-connection-string
```

Update `frontend/.env`:

```env
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 5. Enable Row Level Security (RLS)

Supabase uses Row Level Security for data protection. You may need to create RLS policies:

```sql
-- Example: Enable RLS on tasks table
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own tasks
CREATE POLICY "Users can view own tasks"
  ON tasks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tasks"
  ON tasks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks"
  ON tasks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks"
  ON tasks FOR DELETE
  USING (auth.uid() = user_id);
```

Repeat similar policies for other tables (files, ai_interactions, etc.)

### 6. Set Up Storage (Optional)

If you plan to use file storage:

1. Go to Storage in Supabase Dashboard
2. Create a new bucket called "files"
3. Set it to public or private based on your needs
4. Configure CORS if needed

### 7. Test Connection

Run the backend server and check if it connects:

```bash
cd backend
npm run dev
```

Check the console for any connection errors.

## Security Notes

- Never commit `.env` files to version control
- Keep `SUPABASE_KEY` (service role key) secret - it bypasses RLS
- Use RLS policies to secure your data
- Regularly rotate API keys
- Use environment-specific keys for production

## Troubleshooting

### Connection Issues
- Verify your connection string is correct
- Check if your IP is allowed (if using IP restrictions)
- Ensure database is running

### Authentication Issues
- Verify Supabase Auth is enabled
- Check RLS policies are correctly set
- Ensure JWT secret matches

### Migration Issues
- Run migrations in order
- Check for existing tables before creating
- Verify you have proper permissions

