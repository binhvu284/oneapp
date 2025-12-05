# Vercel Data Storage Fix

## Issue
JSON data files work fine in localhost but appear empty in Vercel deployment.

## Root Cause
1. **Path Resolution**: In Vercel's serverless environment, `__dirname` and `process.cwd()` resolve differently than in local development
2. **File System**: Vercel's file system is read-only (except `/tmp`), so writes won't persist between deployments
3. **Deployment Structure**: The backend might be deployed separately or as serverless functions, changing the working directory

## Solution Applied

### 1. Improved Path Resolution
Updated `backend/src/utils/fileStorage.ts` to:
- Try multiple path resolution strategies
- Use `process.cwd()` as primary method (more reliable in serverless)
- Fallback to `__dirname`-based paths for compiled code
- Try multiple potential locations for the "OneApp data" folder

### 2. Multiple Path Fallback
The `readJsonFile` function now tries multiple paths:
1. Primary calculated path from `getProjectRoot()`
2. `process.cwd() + 'OneApp data'`
3. `process.cwd() + '../OneApp data'` (if in backend directory)
4. `__dirname + '../../..' + 'OneApp data'` (from compiled dist)

### 3. Debug Logging
Added production logging to help diagnose path issues:
- Logs the project root
- Logs the data directory path
- Logs which path successfully found the file
- Logs all attempted paths if file not found

## Important Notes

### ⚠️ Vercel File System Limitations
- **Reads**: Should work if files are in the repository
- **Writes**: Won't persist! Vercel's file system is read-only except `/tmp`
- **Solution for writes**: Consider using:
  - Vercel KV (key-value store)
  - External database (Supabase, MongoDB, etc.)
  - Environment variables for small data
  - Or accept that writes only work in localhost

### ✅ Files Must Be in Repository
Ensure these files are committed to git:
- `OneApp data/categories.json`
- `OneApp data/in_use_app.json`
- Any other JSON files you need

Check with:
```bash
git ls-files "OneApp data/"
```

## Testing in Vercel

After deployment, check the Vercel function logs for:
```
[fileStorage] Project root: ...
[fileStorage] Data directory: ...
[fileStorage] Successfully read file from: ...
```

If you see "File not found in any location", check:
1. Are the JSON files committed to git?
2. Are they in the correct location relative to the backend?
3. Check the logged paths to see what Vercel is trying

## Next Steps

1. **Deploy and test**: Push changes and check Vercel logs
2. **If reads still fail**: Check Vercel function logs for the actual paths being tried
3. **For writes**: Consider migrating to a database or external storage solution

## Alternative Solutions

If file-based storage doesn't work in Vercel:

1. **Use Vercel KV** (recommended for small data):
   ```typescript
   import { kv } from '@vercel/kv'
   await kv.set('categories', JSON.stringify(data))
   const data = await kv.get('categories')
   ```

2. **Use Environment Variables** (for small, static data):
   - Store JSON as environment variable
   - Parse on startup

3. **Use External Database**:
   - Supabase (already configured)
   - MongoDB Atlas
   - PostgreSQL

4. **Use Vercel Blob Storage**:
   - For file storage in Vercel
   - Better than local files

