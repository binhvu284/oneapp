# Supabase Setup Guide for OneApp Backups

## Overview
To enable backup functionality in OneApp, you need to configure Supabase credentials. Backups are stored in Supabase's PostgreSQL database.

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in to your account
3. Click "New Project"
4. Fill in:
   - **Project Name**: `OneApp` (or any name you prefer)
   - **Database Password**: Choose a strong password (save it securely)
   - **Region**: Choose the region closest to you
5. Click "Create new project"
6. Wait for the project to be provisioned (takes 1-2 minutes)

## Step 2: Get Your Supabase Credentials

1. In your Supabase project dashboard, click on **Settings** (gear icon) in the left sidebar
2. Click on **API** in the settings menu
3. You'll see:
   - **Project URL**: Copy this value (e.g., `https://xxxxx.supabase.co`)
   - **anon public** key: Copy this value (starts with `eyJ...`)

## Step 3: Create the Backup Versions Table

1. In your Supabase project dashboard, click on **SQL Editor** in the left sidebar
2. Click **New query**
3. Copy and paste the following SQL (from `database/schema.sql`):

```sql
-- Backup Versions Table
-- Stores metadata about database backups
CREATE TABLE IF NOT EXISTS backup_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  size BIGINT NOT NULL, -- Size in bytes
  storage_url TEXT, -- URL to the actual backup file in Supabase Storage
  description TEXT,
  is_current BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}'::jsonb, -- Additional metadata (e.g., auto-backup settings)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for current backup
CREATE INDEX IF NOT EXISTS idx_backup_versions_is_current ON backup_versions(is_current);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_backup_versions_updated_at BEFORE UPDATE ON backup_versions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

4. Click **Run** (or press Ctrl+Enter)
5. You should see "Success. No rows returned"

## Step 4: Configure Environment Variables

1. In your project root, navigate to the `backend` folder
2. Create a file named `.env` (copy from `.env.example` if it exists)
3. Add the following:

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your-anon-key-here
```

Replace:
- `https://your-project-id.supabase.co` with your actual Project URL from Step 2
- `your-anon-key-here` with your actual anon public key from Step 2

## Step 5: Restart the Backend Server

1. Stop your backend server (Ctrl+C)
2. Restart it:
   ```bash
   cd backend
   npm run dev
   ```

3. You should see: `✅ Supabase client initialized` in the console

## Step 6: Test Backup Creation

1. Navigate to the Shared Database page in your frontend
2. Click "Version & Backup"
3. Click "Create Backup"
4. Enter a backup name
5. Click "Create Backup"
6. You should see "Backup created successfully" instead of an error

## Troubleshooting

### Error: "Supabase is not configured"
- Make sure your `.env` file is in the `backend` folder
- Make sure the variable names are exactly `SUPABASE_URL` and `SUPABASE_KEY`
- Restart your backend server after creating/editing `.env`

### Error: "relation 'backup_versions' does not exist"
- Make sure you ran the SQL script in Step 3
- Check that the table was created in the Supabase SQL Editor

### Error: "permission denied for table backup_versions"
- In Supabase dashboard, go to **Settings** > **API** > **Row Level Security (RLS)**
- Make sure RLS is disabled for the `backup_versions` table, or configure appropriate policies

## Security Notes

- The `.env` file should **never** be committed to Git (it's already in `.gitignore`)
- Use the **anon public** key for client-side operations (it's safe to expose)
- For production, consider using Row Level Security (RLS) policies in Supabase

