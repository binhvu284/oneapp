# Database Schema

This directory contains the database schema and migration files for OneApp.

## Database: PostgreSQL (via Supabase)

## Setup

1. Create a Supabase project at https://supabase.com
2. Get your connection string and API keys
3. Update environment variables in `backend/.env`
4. Run migrations using Supabase CLI or SQL editor

## Schema Overview

### Core Tables
- `users` - User accounts (handled by Supabase Auth)
- `modules` - Module registry
- `module_config` - Module-specific configurations
- `ai_interactions` - AI assistant conversation history
- `tasks` - Task management
- `files` - File storage metadata

## Migrations

Migrations are stored in SQL files and should be run in order.

### Running Migrations

**Using Supabase Dashboard:**
1. Go to SQL Editor in Supabase Dashboard
2. Copy and paste the SQL from migration files
3. Run the queries

**Using Supabase CLI:**
```bash
supabase db push
```

## Notes

- All tables include `created_at` and `updated_at` timestamps
- Foreign keys reference Supabase Auth users table
- Indexes are included for performance optimization

