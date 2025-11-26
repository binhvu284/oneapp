# OneApp Setup Instructions

Complete setup guide for OneApp development environment.

## Prerequisites

Before starting, ensure you have:

- **Node.js** 18+ installed ([Download](https://nodejs.org/))
- **npm** or **yarn** package manager
- **Git** installed
- **Supabase account** ([Sign up](https://supabase.com))
- **GitHub account** (for version control)
- **Vercel account** (for deployment, optional)

## Step 1: Clone Repository

```bash
git clone <your-repo-url>
cd OneApp
```

## Step 2: Supabase Setup

1. Create a new Supabase project at https://supabase.com
2. Get your project credentials:
   - Project URL
   - Anon key
   - Service role key
   - Database connection string
3. Run the database schema:
   - Go to SQL Editor in Supabase Dashboard
   - Copy contents from `database/schema.sql`
   - Paste and execute

See `database/supabase_setup.md` for detailed instructions.

## Step 3: Backend Setup

```bash
cd backend
npm install
```

Create `.env` file:

```bash
cp .env.example .env
```

Edit `.env` with your Supabase credentials:

```env
PORT=3001
NODE_ENV=development
DATABASE_URL=your-supabase-connection-string
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-service-key
SUPABASE_ANON_KEY=your-supabase-anon-key
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000
```

Start the backend server:

```bash
npm run dev
```

The backend should now be running on http://localhost:3001

## Step 4: Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
```

Create `.env` file:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
VITE_API_URL=http://localhost:3001/api
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Start the frontend development server:

```bash
npm run dev
```

The frontend should now be running on http://localhost:3000

## Step 5: Verify Installation

1. Open http://localhost:3000 in your browser
2. You should see the OneApp dashboard
3. Check browser console for any errors
4. Check backend terminal for API requests

## Development Workflow

### Running Both Servers

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

### Building for Production

**Backend:**
```bash
cd backend
npm run build
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
```

The built files will be in `frontend/dist/`

## Project Structure

```
OneApp/
├── frontend/          # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── contexts/
│   │   ├── services/
│   │   └── types/
│   └── package.json
├── backend/           # Node.js backend
│   ├── src/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── utils/
│   │   └── index.ts
│   └── package.json
├── database/          # Database schemas
│   ├── schema.sql
│   └── migrations/
├── AI data/          # AI assistant data
├── Dev data/         # Development docs
└── README.md
```

## Common Issues

### Port Already in Use

If port 3000 or 3001 is already in use:

**Backend:**
```bash
PORT=3002 npm run dev
```

**Frontend:**
Update `vite.config.ts` to use a different port

### Database Connection Errors

- Verify Supabase credentials in `.env`
- Check if Supabase project is active
- Verify database schema has been run

### CORS Errors

- Ensure `CORS_ORIGIN` in backend `.env` matches frontend URL
- Check backend is running before starting frontend

### Module Not Found Errors

- Run `npm install` in both frontend and backend
- Delete `node_modules` and `package-lock.json`, then reinstall

## Next Steps

1. Read `Dev data/Architecture.md` for architecture details
2. Read `Dev data/UI Requirement.md` for UI/UX guidelines
3. Read `Dev data/Technology.md` for technology stack info
4. Explore the codebase and start developing!

## Getting Help

- Check documentation in `Dev data/` folder
- Review code comments in source files
- Check Supabase documentation: https://supabase.com/docs
- Check React documentation: https://react.dev
- Check Express documentation: https://expressjs.com

## Deployment

See deployment instructions in `README.md` for Vercel deployment setup.

