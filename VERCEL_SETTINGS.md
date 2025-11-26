# Vercel Deployment Settings

## ⚠️ Important: Configure These Settings in Vercel Dashboard

When deploying to Vercel, you **MUST** configure these settings manually:

### Step 1: Framework Preset
**Select: `Vite`** ⭐

### Step 2: Root Directory
**Set to: `frontend`**

**How to set:**
1. In Vercel project settings
2. Go to "Settings" → "General"
3. Find "Root Directory"
4. Click "Edit"
5. Enter: `frontend`
6. Save

### Step 3: Build & Development Settings

After setting Root Directory to `frontend`, Vercel will auto-detect:
- **Build Command**: `npm run build` ✅
- **Output Directory**: `dist` ✅
- **Install Command**: `npm install` ✅
- **Development Command**: `npm run dev` ✅

### Step 4: Environment Variables

Add in Settings → Environment Variables:

```
VITE_API_URL=https://your-backend-url/api
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Why Root Directory is Important

Setting Root Directory to `frontend` ensures:
- ✅ Vercel only installs frontend dependencies
- ✅ Build command runs in the correct folder
- ✅ No backend build errors
- ✅ Faster builds

## After Configuration

1. Save settings in Vercel dashboard
2. Trigger a new deployment
3. Build should succeed! ✅

## Troubleshooting

**If build still fails:**
- Verify Root Directory is set to `frontend`
- Check that Framework Preset is `Vite`
- Review build logs for specific errors
- Ensure all environment variables are set

