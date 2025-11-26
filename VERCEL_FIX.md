# Vercel Deployment Fix

## Issue Fixed

The build was failing because Vercel was trying to build both backend and frontend, but backend dependencies weren't installed.

## Solution Applied

1. **Updated `vercel.json`**: Configured for frontend-only deployment
2. **Updated root `package.json`**: Changed build script to only build frontend
3. **Created `.vercelignore`**: Excludes backend and unnecessary files from deployment

## Vercel Configuration

When deploying on Vercel, use these settings:

### Framework Preset
**Select: `Vite`** ⭐

### Build Settings (Auto-detected with Vite)
- **Root Directory**: `frontend`
- **Build Command**: `npm run build` (runs in frontend folder)
- **Output Directory**: `dist`
- **Install Command**: `npm install` (runs in frontend folder)

### Important Notes

1. **Root Directory**: Must be set to `frontend` in Vercel dashboard
2. **Framework**: Select `Vite` - this auto-detects all settings
3. **Build Command**: Vercel will run `npm run build` inside the `frontend` folder
4. **Backend**: Not deployed with frontend (deploy separately if needed)

## Environment Variables

Add these in Vercel Dashboard → Settings → Environment Variables:

```
VITE_API_URL=https://your-backend-url/api
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Redeploy

After these changes:
1. Commit and push the changes
2. Vercel will automatically redeploy
3. Or manually trigger a redeploy in Vercel dashboard

The build should now succeed! ✅

