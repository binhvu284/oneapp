# Vercel + Supabase Direct Connection Setup

## Overview

The frontend now connects directly to Supabase (similar to Next.js apps), bypassing the backend API routes. This allows the app to work on Vercel without needing to deploy the backend separately.

## Required Environment Variables in Vercel

Go to your Vercel project → Settings → Environment Variables and add:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**How to get these values:**
1. Go to your Supabase project dashboard
2. Click on "Settings" → "API"
3. Copy the "Project URL" → This is your `VITE_SUPABASE_URL`
4. Copy the "anon public" key → This is your `VITE_SUPABASE_ANON_KEY`

## Database Setup

Make sure the following table exists in your Supabase database:

### `backup_versions` Table

Run this SQL in your Supabase SQL Editor:

```sql
CREATE TABLE IF NOT EXISTS backup_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  size BIGINT NOT NULL,
  storage_url TEXT,
  description TEXT,
  is_current BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_backup_versions_is_current ON backup_versions(is_current);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_backup_versions_updated_at BEFORE UPDATE ON backup_versions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## Row-Level Security (RLS)

If you want to make the `backup_versions` table publicly readable (for the frontend to access it):

```sql
-- Enable RLS
ALTER TABLE backup_versions ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows SELECT for all users
CREATE POLICY "Allow public read access" ON backup_versions
  FOR SELECT USING (true);

-- Create a policy that allows INSERT for all users
CREATE POLICY "Allow public insert access" ON backup_versions
  FOR INSERT WITH CHECK (true);

-- Create a policy that allows UPDATE for all users
CREATE POLICY "Allow public update access" ON backup_versions
  FOR UPDATE USING (true);
```

**Note:** For production, you should restrict these policies based on authentication. The above policies allow public access, which is fine for development but should be secured in production.

## How It Works

1. **Frontend connects directly to Supabase** using the `@supabase/supabase-js` client
2. **No backend required** - All database operations happen client-side
3. **Fallback to API** - If Supabase credentials are not configured, it falls back to the backend API (for local development)

## Testing

After setting environment variables and creating the table:

1. Deploy to Vercel (or redeploy if already deployed)
2. Visit your deployed app
3. Go to "OneApp Data" → "Shared Database"
4. You should see:
   - Schema displayed correctly
   - Backup versions loading from Supabase
   - Ability to create new backups
   - Ability to apply backups

## Troubleshooting

### Data not loading

1. **Check environment variables** in Vercel:
   - Go to Settings → Environment Variables
   - Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set
   - Make sure they're set for "Production" environment
   - Redeploy after adding/updating variables

2. **Check browser console** for errors:
   - Open browser DevTools (F12)
   - Check Console tab for Supabase connection errors
   - Look for messages like "Supabase credentials not configured"

3. **Verify table exists**:
   - Go to Supabase Dashboard → Table Editor
   - Check if `backup_versions` table exists

4. **Check RLS policies**:
   - Go to Supabase Dashboard → Authentication → Policies
   - Verify RLS policies allow SELECT, INSERT, UPDATE operations

### Still seeing API errors

If you see errors about `/api/schema` or `/api/backup-versions`:
- The frontend is falling back to the backend API
- This means Supabase credentials are not configured correctly
- Check environment variables in Vercel and redeploy

## Next Steps

1. Set environment variables in Vercel
2. Create the `backup_versions` table in Supabase
3. Set up RLS policies (optional, for public access)
4. Redeploy your Vercel project
5. Test the deployment

The app should now work without needing the backend deployed! 🎉

