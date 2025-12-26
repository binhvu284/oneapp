-- Sample API entries for testing the OnlyAPI page
-- Run this SQL in your Supabase SQL Editor to add sample APIs

-- 1. Supabase Database API
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
  'https://your-project-id.supabase.co',  -- Replace with your actual Supabase URL
  'your-anon-public-key-here',  -- Replace with your actual Supabase anon key
  'unknown',
  'OneApp Data',
  'Supabase database connection for OneApp shared database. This API manages all database operations including tables, backups, and data storage.',
  true,
  jsonb_build_object(
    'tool', 'Supabase',
    'version', '1.0.0',
    'created_via', 'manual_insert'
  )
) ON CONFLICT DO NOTHING;

-- 2. Sample REST API (for testing)
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
  'Example REST API',
  'REST',
  'https://api.example.com',
  'example-api-key-12345',
  'unknown',
  'OnlyAPI',
  'Example REST API for demonstration purposes.',
  true,
  jsonb_build_object(
    'base_url', 'https://api.example.com',
    'version', 'v1'
  )
) ON CONFLICT DO NOTHING;

-- 3. Sample AI API (for testing)
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
  'OpenAI API',
  'AI',
  'https://api.openai.com/v1',
  'sk-example-key-here',
  'unknown',
  'AI Assistant',
  'OpenAI API for AI Assistant features in OneApp.',
  false,  -- Disabled by default
  jsonb_build_object(
    'provider', 'OpenAI',
    'model', 'gpt-4'
  )
) ON CONFLICT DO NOTHING;

-- View all inserted APIs
SELECT 
  id,
  name,
  type,
  status,
  app_source,
  enabled,
  created_at
FROM apis
ORDER BY created_at DESC;

