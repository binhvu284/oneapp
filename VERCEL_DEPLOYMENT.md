# Vercel Deployment Guide for OneApp

This guide explains how to deploy OneApp to Vercel, including both frontend and backend.

## Project Structure

OneApp has a **monorepo structure** with:
- **Frontend**: React + Vite (in `frontend/` folder)
- **Backend**: Node.js + Express (in `backend/` folder)

## Framework Settings for Vercel

### ✅ Recommended: Frontend Only Deployment

**Framework Preset**: `Vite`

**Build Settings:**
- **Framework Preset**: `Vite` ⭐ (This is the correct setting)
- **Root Directory**: `frontend`
- **Build Command**: `npm run build` (auto-detected)
- **Output Directory**: `dist` (auto-detected)
- **Install Command**: `npm install` (auto-detected)
- **Node.js Version**: 18.x

**Why Vite?**
- Your frontend uses Vite as the build tool
- Vercel has native support for Vite
- Auto-detects build settings when you select "Vite" framework

### Alternative: Backend Deployment (Separate Project)

If you want to deploy the backend separately:

**Framework Preset**: `Other`

**Build Settings:**
- **Framework Preset**: `Other`
- **Root Directory**: `backend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Start Command**: `npm start`
- **Node.js Version**: 18.x

**Note**: For Express backends, consider using:
- Railway (https://railway.app)
- Render (https://render.com)
- Fly.io (https://fly.io)
- DigitalOcean App Platform

These services are better suited for long-running Express servers.

## Step-by-Step Deployment

### Method 1: Deploy Frontend Only (Easiest)

1. **Go to Vercel Dashboard**
   - Visit https://vercel.com
   - Sign in with GitHub

2. **Import Project**
   - Click "Add New Project"
   - Import `binhvu284/oneapp` repository

3. **Configure Project Settings** ⚠️ **CRITICAL STEP**
   
   **Framework Preset**: Select `Vite` ⭐
   
   **Root Directory**: ⚠️ **MUST SET THIS MANUALLY**
   - Click "Edit" next to Root Directory
   - Enter: `frontend`
   - Click "Save"
   - **This is essential!** Without this, Vercel will try to build from root and fail
   
   **After setting Root Directory, these will auto-detect:**
   - **Build Command**: `npm run build` ✅
   - **Output Directory**: `dist` ✅
   - **Install Command**: `npm install` ✅

4. **Environment Variables**
   Add these in Vercel dashboard:
   ```
   VITE_API_URL=https://your-backend-url.vercel.app/api
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete

### Method 2: Deploy Full Stack (Frontend + Backend)

#### Setup 1: Deploy Backend as Serverless Functions

1. **Create `api/` folder in root** (for Vercel serverless functions)
   - Copy backend routes to `api/` folder
   - Convert Express routes to Vercel serverless functions

2. **Create `vercel.json`** (already created in project root)

3. **Deploy to Vercel**
   - Framework Preset: `Other`
   - Root Directory: `.` (root)
   - Build Command: `cd frontend && npm install && npm run build`
   - Output Directory: `frontend/dist`
   - Functions Directory: `api`

#### Setup 2: Use Separate Backend Deployment

1. **Deploy Backend Separately**
   - Create a new Vercel project for backend
   - Framework Preset: `Other`
   - Root Directory: `backend`
   - Build Command: `npm run build`
   - Output Directory: `dist`

2. **Deploy Frontend**
   - Use backend URL in frontend environment variables
   - `VITE_API_URL=https://your-backend.vercel.app/api`

## Recommended Approach: Separate Deployments

For OneApp, I recommend **separate deployments**:

### Frontend Project (Vercel)
- **Framework**: Vite
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### Backend Project (Vercel - Optional, or use separate service)
- **Framework**: Other
- **Root Directory**: `backend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Start Command**: `npm start`

**OR** use a separate Node.js hosting service like:
- Railway
- Render
- Fly.io
- DigitalOcean App Platform

## Environment Variables Setup

### Frontend Environment Variables (in Vercel)

```
VITE_API_URL=https://your-backend-url/api
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### Backend Environment Variables (if deploying backend)

```
PORT=3001
NODE_ENV=production
DATABASE_URL=your-supabase-connection-string
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-service-key
SUPABASE_ANON_KEY=your-supabase-anon-key
JWT_SECRET=your-production-jwt-secret
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://your-frontend-url.vercel.app
```

## Vercel Configuration File

The project includes `vercel.json` for full-stack deployment. For frontend-only deployment, you can ignore this file.

## Build Settings Summary

### Frontend (Recommended)
```
Framework Preset: Vite
Root Directory: frontend
Build Command: npm run build
Output Directory: dist
Install Command: npm install
Node.js Version: 18.x
```

### Backend (If deploying separately)
```
Framework Preset: Other
Root Directory: backend
Build Command: npm run build
Output Directory: dist
Install Command: npm install
Start Command: npm start
Node.js Version: 18.x
```

## Post-Deployment

1. **Update Frontend API URL**
   - Set `VITE_API_URL` to your backend URL
   - Redeploy frontend

2. **Configure CORS**
   - Update backend `CORS_ORIGIN` to include frontend URL
   - Format: `https://your-app.vercel.app`

3. **Test Deployment**
   - Visit your Vercel URL
   - Test all features
   - Check browser console for errors

## Troubleshooting

### Build Fails
- Check Node.js version (should be 18+)
- Verify all dependencies are in `package.json`
- Check build logs in Vercel dashboard

### API Calls Fail
- Verify `VITE_API_URL` is set correctly
- Check CORS settings in backend
- Verify backend is deployed and accessible

### Environment Variables Not Working
- Ensure variables start with `VITE_` for frontend
- Redeploy after adding variables
- Check variable names match exactly

## Next Steps

1. Deploy frontend to Vercel
2. Set up Supabase (if not done)
3. Deploy backend (separate service or Vercel)
4. Configure environment variables
5. Test full application

## Resources

- Vercel Documentation: https://vercel.com/docs
- Vite Deployment: https://vitejs.dev/guide/static-deploy.html#vercel
- Vercel Environment Variables: https://vercel.com/docs/concepts/projects/environment-variables

