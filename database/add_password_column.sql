-- Add password column to oneapp_users table
-- Run this SQL in your Supabase SQL Editor if the password column doesn't exist

ALTER TABLE public.oneapp_users
ADD COLUMN IF NOT EXISTS password text;

-- Add comment to document the column
COMMENT ON COLUMN public.oneapp_users.password IS 'Hashed password for hybrid authentication (optional, nullable)';

