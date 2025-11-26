# Quick Start Guide - Run Locally

Get OneApp running on localhost in 3 steps!

## Step 1: Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend (in a new terminal)
cd frontend
npm install
```

## Step 2: Create Environment Files

**Backend:**
```bash
cd backend
# Copy the example file
# On Windows: copy .env.example .env
# On Linux/Mac: cp .env.example .env
```

Then edit `backend/.env` - you can leave Supabase fields empty for now:
```env
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
JWT_SECRET=local-dev-secret-key
JWT_EXPIRES_IN=7d
```

**Frontend:**
```bash
cd frontend
# Copy the example file
# On Windows: copy .env.example .env
# On Linux/Mac: cp .env.example .env
```

Then edit `frontend/.env`:
```env
VITE_API_URL=http://localhost:3001/api
```

## Step 3: Start Servers

**Option 1: Single Command (Easiest)**

From project root:
```bash
npm run dev
```

This starts both servers together! 🎉

**Option 2: Separate Commands**

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

**Option 3: Use Scripts**

**Windows:** `start-dev.bat`  
**Linux/Mac:** `./start-dev.sh`

## Step 4: Open Browser

Open http://localhost:3000

You should see the OneApp dashboard! 🎉

## What Works Without Supabase?

✅ Frontend UI - All pages load and display  
✅ Backend API - Health check and non-auth endpoints work  
✅ Navigation - You can browse all pages  
⚠️ Authentication - Will show warnings (expected)  
⚠️ Database Features - Won't work without Supabase  

## Next Steps

1. Test the application locally
2. When ready, set up Supabase (see `LOCAL_DEVELOPMENT.md`)
3. Deploy to cloud when ready

## Troubleshooting

**Port already in use?**
- Backend: Change `PORT` in `backend/.env`
- Frontend: Vite will auto-use next available port

**Module not found errors?**
```bash
# Delete and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Need more help?**
- See `LOCAL_DEVELOPMENT.md` for detailed guide
- See `SETUP.md` for full setup instructions

Happy coding! 🚀

