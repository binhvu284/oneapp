# Environment Variables Setup Guide

## Quick Setup for Vercel

### Step 1: Get Your Supabase Credentials

1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** → **API**
4. Copy these values:
   - **Project URL** → This is your `VITE_SUPABASE_URL`
   - **anon public** key → This is your `VITE_SUPABASE_ANON_KEY` ⚠️ **IMPORTANT: Use the ANON key, NOT the secret key!**

**⚠️ CRITICAL SECURITY NOTE:**
- ✅ **USE**: The **"anon public"** key (safe for frontend/browser)
- ❌ **NEVER USE**: The **"service_role" secret** key (backend only, never expose in browser!)
- The secret key will cause a "Forbidden use of secret API key in browser" error
- If you accidentally exposed a secret key, delete it immediately from Supabase Dashboard

### Step 2: Add to Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables:

#### Required Variables:

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

#### Optional Variables:

```
VITE_API_URL=https://your-backend-url.vercel.app/api
```

**Note:** `VITE_API_URL` is optional. If not set, the app will use Supabase direct connection only.

### Step 3: Set Environment

Make sure to set these variables for:
- ✅ **Production**
- ✅ **Preview** (optional, but recommended)
- ✅ **Development** (optional, for local testing)

### Step 4: Redeploy

After adding the environment variables:
1. Go to **Deployments** tab
2. Click the **"..."** menu on the latest deployment
3. Click **"Redeploy"**
4. Or push a new commit to trigger automatic deployment

## Local Development Setup

### Option 1: Create `.env` file (Recommended)

1. Copy `frontend/.env.example` to `frontend/.env`:
   ```bash
   cp frontend/.env.example frontend/.env
   ```

2. Fill in your actual values in `frontend/.env`:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   VITE_API_URL=http://localhost:3001/api
   ```

3. Restart your development server

### Option 2: Use Vercel CLI (Alternative)

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Link your project:
   ```bash
   cd frontend
   vercel link
   ```

3. Pull environment variables:
   ```bash
   vercel env pull .env.local
   ```

## Verification

After setting up environment variables:

1. **Check Vercel Build Logs**: Look for any warnings about missing environment variables
2. **Check Browser Console**: Open DevTools (F12) and check for:
   - ✅ `✅ Supabase client initialized for direct database access`
   - ❌ `⚠️ Supabase credentials not configured` (if you see this, variables are not set correctly)

## Troubleshooting

### Variables not working in Vercel?

1. **Check variable names**: Must start with `VITE_` prefix
2. **Check environment**: Make sure variables are set for "Production"
3. **Redeploy**: Environment variables only apply to new deployments
4. **Check for typos**: Variable names are case-sensitive
5. **Check for whitespace**: Make sure there are no leading/trailing spaces in values
6. **Verify URL format**: Must be a valid HTTP/HTTPS URL (e.g., `https://xxxxx.supabase.co`)

### Still seeing "Supabase not configured" error?

1. Verify variables are set in Vercel Dashboard
2. Check that variable names match exactly:
   - `VITE_SUPABASE_URL` (not `SUPABASE_URL`)
   - `VITE_SUPABASE_ANON_KEY` (not `SUPABASE_ANON_KEY`)
3. Make sure you redeployed after adding variables
4. Check browser console for detailed error messages
5. Verify URL format: Should start with `https://` and end with `.supabase.co`

### Seeing "Invalid supabaseUrl" error?

This means the `VITE_SUPABASE_URL` is either:
- Empty or not set
- Has invalid format (not a valid HTTP/HTTPS URL)
- Has leading/trailing whitespace

**Fix:**
1. Go to Vercel → Settings → Environment Variables
2. Check `VITE_SUPABASE_URL` value
3. Make sure it's exactly: `https://your-project-id.supabase.co` (no spaces, no quotes)
4. Redeploy your project

## Backend Environment Variables (for Local Development)

If you're running the backend server locally, create a `backend/.env` file:

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**To get the Service Role Key:**
1. Go to Supabase Dashboard → **Settings** → **API**
2. Find the **"service_role" secret** key (⚠️ **NEVER expose this in frontend!**)
3. Copy it to `SUPABASE_SERVICE_ROLE_KEY` in your backend `.env` file

**Why Service Role Key?**
- Used by the backend to auto-confirm user emails during signup (skips email verification)
- Has admin privileges, so it can bypass Row Level Security (RLS)
- **MUST** be kept secret and only used on the backend server

**Note:** If `SUPABASE_SERVICE_ROLE_KEY` is not set, users will need to confirm their email manually. The signup will still work, but they'll need to click the confirmation link in their email.

## Example Values

Here's what your variables should look like (with example values):

### Frontend (`.env` in `frontend/` folder):
```env
VITE_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MDAwMDAwMCwiZXhwIjoxOTU1NTY0MDAwfQ.example
VITE_API_URL=
```

### Backend (`.env` in `backend/` folder):
```env
SUPABASE_URL=https://abcdefghijklmnop.supabase.co
SUPABASE_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-secret-key-here
```

**Important:** Never commit your actual `.env` file to git. Only commit `.env.example` as a template.

