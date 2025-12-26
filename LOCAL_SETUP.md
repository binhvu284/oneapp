# Local Development Setup for Backup Feature

Since your Supabase project is already set up and connected to Vercel, you just need to configure it locally.

## Quick Setup (2 minutes)

### Step 1: Get Your Supabase Credentials

1. Go to your Supabase project dashboard: https://app.supabase.com
2. Select your project
3. Go to **Settings** → **API**
4. Copy these two values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public** key (starts with `eyJ...`)

### Step 2: Create `.env` File

1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```

2. Create a `.env` file (copy from `.env.example` if you want):
   ```bash
   # Windows
   copy .env.example .env
   
   # Mac/Linux
   cp .env.example .env
   ```

3. Open `.env` and add your Supabase credentials:
   ```env
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_KEY=your-anon-key-here
   ```

   Replace with your actual values from Step 1.

### Step 3: Restart Backend Server

1. Stop your backend server (Ctrl+C if running)
2. Restart it:
   ```bash
   npm run dev
   ```

3. Look for this message in the console:
   ```
   ✅ Supabase client initialized
   ```

   If you see this, you're all set! ✅

### Step 4: Test Backup Creation

1. Open your frontend app (usually `http://localhost:3000`)
2. Navigate to **OneApp Data** → **Shared Database**
3. Click **"Version & Backup"** button
4. Click **"Create Backup"**
5. Enter a backup name (e.g., "Test Backup")
6. Click **"Create Backup"**

You should see "Backup created successfully" instead of an error! 🎉

## Troubleshooting

### Still seeing "Supabase is not configured"?
- ✅ Make sure `.env` file is in the `backend` folder (not project root)
- ✅ Check that variable names are exactly `SUPABASE_URL` and `SUPABASE_KEY`
- ✅ Make sure there are no extra spaces or quotes around the values
- ✅ Restart your backend server after creating/editing `.env`

### Backend server not starting?
- ✅ Make sure you're in the `backend` folder when running `npm run dev`
- ✅ Check that Node.js is installed: `node --version`
- ✅ Try deleting `node_modules` and reinstalling: `rm -rf node_modules && npm install`

### Getting database errors?
- ✅ Verify the `backup_versions` table exists in your Supabase project
- ✅ Go to Supabase dashboard → **Table Editor** → Check if `backup_versions` table is there
- ✅ If not, run the SQL from `database/schema.sql` (backup_versions table section)

## Example `.env` File

```env
# Supabase Configuration
SUPABASE_URL=https://abcdefghijklmnop.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjIzOTAyMiwiZXhwIjoxOTMxODE1MDIyfQ.example

# Server Configuration (optional)
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

**Note:** Never commit your `.env` file to Git. It's already in `.gitignore`.

