-- Insert Supabase API into the apis table
-- This will create a sample Supabase API entry that you can see in the OnlyAPI page

-- Replace these placeholder values with your actual Supabase credentials:
-- - YOUR_SUPABASE_URL: Your Supabase project URL (e.g., https://xxxxx.supabase.co)
-- - YOUR_SUPABASE_ANON_KEY: Your Supabase anon public key

INSERT INTO apis (
  name,
  type,
  api_url,
  api_key,
  status,
  app_source,
  description,
  enabled,
  metadata
) VALUES (
  'Supabase Database',
  'Database',
  'YOUR_SUPABASE_URL',  -- Replace with your actual Supabase URL
  'YOUR_SUPABASE_ANON_KEY',  -- Replace with your actual Supabase anon key
  'unknown',  -- Will be updated when connection is tested
  'OneApp Data',
  'Supabase database connection for OneApp shared database. This API manages all database operations including tables, backups, and data storage.',
  true,
  jsonb_build_object(
    'tool', 'Supabase',
    'version', '1.0.0',
    'created_via', 'manual_insert',
    'features', jsonb_build_array('database', 'storage', 'auth', 'realtime')
  )
);

-- If you want to insert with a specific ID (optional):
-- INSERT INTO apis (
--   id,
--   name,
--   type,
--   api_url,
--   api_key,
--   status,
--   app_source,
--   description,
--   enabled,
--   metadata
-- ) VALUES (
--   gen_random_uuid(),  -- Or use a specific UUID
--   'Supabase Database',
--   'Database',
--   'YOUR_SUPABASE_URL',
--   'YOUR_SUPABASE_ANON_KEY',
--   'unknown',
--   'OneApp Data',
--   'Supabase database connection for OneApp shared database.',
--   true,
--   jsonb_build_object('tool', 'Supabase', 'version', '1.0.0')
-- );

-- To check if the insert was successful:
-- SELECT * FROM apis WHERE name = 'Supabase Database';

-- To update the API URL and key after inserting (if needed):
-- UPDATE apis 
-- SET 
--   api_url = 'YOUR_SUPABASE_URL',
--   api_key = 'YOUR_SUPABASE_ANON_KEY'
-- WHERE name = 'Supabase Database';

