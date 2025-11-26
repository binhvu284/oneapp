# Local Development Setup Guide

This guide will help you set up OneApp to run locally on your machine for testing before deploying to cloud services.

## Quick Start

### 1. Install Dependencies

**Option A: Install All at Once (Recommended)**
```bash
npm run install:all
```

**Option B: Install Separately**

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

**Root (for concurrently):**
```bash
npm install
```

### 2. Create Environment Files

**Backend `.env`:**
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` with minimal configuration:
```env
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
JWT_SECRET=local-dev-secret-key-change-in-production
JWT_EXPIRES_IN=7d

# Supabase (optional for initial testing)
# Leave these empty or add your Supabase credentials if you have them
SUPABASE_URL=
SUPABASE_KEY=
SUPABASE_ANON_KEY=
DATABASE_URL=
```

**Frontend `.env`:**
```bash
cd frontend
cp .env.example .env
```

Edit `frontend/.env`:
```env
VITE_API_URL=http://localhost:3001/api

# Supabase (optional for initial testing)
# Leave these empty or add your Supabase credentials if you have them
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

### 3. Start Development Servers

**Option A: Single Command (Recommended)**

From the project root:
```bash
npm run dev
```

This starts both servers together using `concurrently`!

**Option B: Separate Terminals**

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

### 4. Test the Application

1. Open http://localhost:3000 in your browser
2. You should see the OneApp dashboard
3. Navigate through the pages (Dashboard, AI Assistant, Modules, Settings)
4. Check the browser console for any errors
5. Check backend terminal for API requests

## Testing Without Supabase

The application is designed to work in **demo mode** without Supabase credentials:

- ✅ Frontend will load and display UI
- ✅ Backend API will respond (except auth endpoints)
- ⚠️ Authentication features will show warnings
- ⚠️ Database operations will not work

This allows you to:
- Test UI/UX
- Test frontend-backend communication
- Develop features without database setup
- See the application structure

## Testing With Supabase (Recommended)

For full functionality, set up Supabase:

### Option 1: Use Supabase Cloud (Free Tier)

1. Go to https://supabase.com and create an account
2. Create a new project
3. Get your credentials from Project Settings > API
4. Run the database schema:
   - Go to SQL Editor in Supabase Dashboard
   - Copy contents from `database/schema.sql`
   - Paste and run
5. Update your `.env` files with Supabase credentials

### Option 2: Use Local Supabase (Advanced)

If you want to run Supabase locally:

```bash
# Install Supabase CLI
npm install -g supabase

# Initialize Supabase locally
supabase init

# Start local Supabase
supabase start

# Use the local connection string in your .env
```

## Common Issues & Solutions

### Port Already in Use

**Backend port 3001 in use:**
```bash
# Change port in backend/.env
PORT=3002
```

**Frontend port 3000 in use:**
- Vite will automatically try the next available port
- Or update `vite.config.ts` to use a different port

### Module Not Found Errors

```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### TypeScript Errors

```bash
# Check TypeScript compilation
cd frontend && npm run type-check
cd backend && npm run type-check
```

### CORS Errors

- Ensure backend is running before frontend
- Check `CORS_ORIGIN` in backend `.env` matches frontend URL
- Default is `http://localhost:3000`

### Supabase Connection Errors

- If you see Supabase warnings, that's normal without credentials
- The app will work in demo mode
- Add Supabase credentials to enable full functionality

## Development Workflow

### Hot Reload

Both frontend and backend support hot reload:
- **Frontend**: Vite automatically reloads on file changes
- **Backend**: `tsx watch` automatically restarts on file changes

### API Testing

Test backend API endpoints:

```bash
# Health check
curl http://localhost:3001/api/health

# Should return:
# {"success":true,"message":"OneApp API is running",...}
```

### Frontend API Calls

The frontend is configured to proxy `/api/*` requests to `http://localhost:3001/api/*` automatically.

## Next Steps

Once local development is working:

1. ✅ Test all pages and features
2. ✅ Verify API endpoints work
3. ✅ Set up Supabase for database features
4. ✅ Test authentication flow
5. ✅ Prepare for deployment

## Troubleshooting

### Check Logs

**Backend logs:** Check the terminal where you ran `npm run dev`
**Frontend logs:** Check browser console (F12)

### Verify Installation

```bash
# Check Node.js version (should be 18+)
node --version

# Check npm version
npm --version

# Verify dependencies installed
cd backend && npm list --depth=0
cd frontend && npm list --depth=0
```

### Reset Everything

If something goes wrong:

```bash
# Backend
cd backend
rm -rf node_modules package-lock.json
npm install

# Frontend
cd frontend
rm -rf node_modules package-lock.json
npm install
```

## Need Help?

- Check `SETUP.md` for detailed setup instructions
- Review `Dev data/Architecture.md` for architecture details
- Check `database/supabase_setup.md` for Supabase setup
- Review code comments in source files

Happy coding! 🚀

