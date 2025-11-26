# 🚀 START HERE - Local Development Setup

Follow these steps to get OneApp running on localhost for testing.

## ✅ Prerequisites

- Node.js 18+ installed ([Download](https://nodejs.org/))
- npm or yarn package manager
- A code editor (VS Code, Cursor, etc.)

## 🎯 Quick Setup (3 Steps)

### 1. Install Dependencies

Open terminal in the project root and run:

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies (in a new terminal or after backend)
cd ../frontend
npm install
```

### 2. Create Environment Files

**Backend Environment File:**

Create `backend/.env` file with this content:
```env
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
JWT_SECRET=local-dev-secret-key-change-in-production
JWT_EXPIRES_IN=7d

# Supabase (optional - leave empty for demo mode)
SUPABASE_URL=
SUPABASE_KEY=
SUPABASE_ANON_KEY=
DATABASE_URL=
```

**Frontend Environment File:**

Create `frontend/.env` file with this content:
```env
VITE_API_URL=http://localhost:3001/api

# Supabase (optional - leave empty for demo mode)
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

> **Note:** You can leave Supabase fields empty for now. The app will run in demo mode.

### 3. Start Development Servers

**Option A: Single Command (Recommended)**

From the project root:
```bash
npm run dev
```

This starts both backend and frontend servers together!

**Option B: Separate Terminals**

**Terminal 1 - Start Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Start Frontend:**
```bash
cd frontend
npm run dev
```

**Option C: Use Startup Scripts**

**Windows:**
```bash
start-dev.bat
```

**Linux/Mac:**
```bash
chmod +x start-dev.sh
./start-dev.sh
```

You should see both servers starting:
- Backend: `🚀 Server running on port 3001`
- Frontend: `➜  Local:   http://localhost:3000/`

### 4. Open in Browser

Open http://localhost:3000

You should see the OneApp dashboard! 🎉

## 📋 What to Expect

### ✅ Works Without Supabase:
- Frontend UI loads and displays correctly
- Navigation between pages works
- Backend API responds (health check, modules, etc.)
- Theme switching works

### ⚠️ Limited Without Supabase:
- Authentication features show warnings
- Database operations won't work
- AI chat will work but won't save history

This is normal! You can test the UI and frontend-backend communication without Supabase.

## 🔧 Troubleshooting

### Port Already in Use

**Backend (port 3001):**
- Change `PORT=3002` in `backend/.env`
- Update `VITE_API_URL` in `frontend/.env` to match

**Frontend (port 3000):**
- Vite will automatically use the next available port
- Check the terminal output for the actual URL

### Module Not Found Errors

```bash
# Delete node_modules and reinstall
cd backend
rm -rf node_modules package-lock.json
npm install

cd ../frontend
rm -rf node_modules package-lock.json
npm install
```

### TypeScript Errors

Make sure you have the latest dependencies:
```bash
cd backend && npm install
cd ../frontend && npm install
```

### CORS Errors

- Make sure backend is running before frontend
- Check `CORS_ORIGIN` in `backend/.env` matches frontend URL (default: `http://localhost:3000`)

## 📚 Next Steps

1. **Test the Application**
   - Navigate through all pages
   - Test the UI components
   - Check browser console for errors

2. **Set Up Supabase (Optional)**
   - See `LOCAL_DEVELOPMENT.md` for Supabase setup
   - Or `database/supabase_setup.md` for detailed guide

3. **Start Developing**
   - See `MODULES.md` for module ideas
   - See `Dev data/Architecture.md` for architecture details

## 📖 More Documentation

- **LOCAL_DEVELOPMENT.md** - Detailed local development guide
- **SETUP.md** - Complete setup instructions
- **QUICK_START.md** - Quick reference guide
- **Dev data/Architecture.md** - Architecture details
- **MODULES.md** - Module information and ideas

## 🆘 Need Help?

1. Check the browser console (F12) for frontend errors
2. Check backend terminal for API errors
3. Review `LOCAL_DEVELOPMENT.md` for common issues
4. Verify all environment variables are set correctly

## ✨ You're Ready!

The project is set up and ready for local development. Start coding! 🚀

