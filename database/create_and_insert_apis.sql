-- Step 1: Create the apis table (if it doesn't exist)
-- This creates the table structure for storing API configurations

CREATE TABLE IF NOT EXISTS apis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'Database', 'AI', 'REST', 'GraphQL', 'Integrated', etc.
  api_url TEXT NOT NULL,
  api_key TEXT NOT NULL, -- Encrypted/stored securely
  status VARCHAR(20) NOT NULL DEFAULT 'unknown' CHECK (status IN ('connected', 'disconnected', 'error', 'unknown')),
  last_checked TIMESTAMP WITH TIME ZONE,
  app_source VARCHAR(100), -- 'OneApp Data', 'AI Assistant', 'OnlyAPI', etc.
  description TEXT,
  enabled BOOLEAN DEFAULT TRUE,
  metadata JSONB DEFAULT '{}'::jsonb, -- Additional API-specific config (headers, auth type, etc.)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_apis_type ON apis(type);
CREATE INDEX IF NOT EXISTS idx_apis_app_source ON apis(app_source);
CREATE INDEX IF NOT EXISTS idx_apis_status ON apis(status);
CREATE INDEX IF NOT EXISTS idx_apis_enabled ON apis(enabled);

-- Create trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_apis_updated_at BEFORE UPDATE ON apis
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Step 2: Insert Supabase API (replace placeholders with your actual values)
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
  'https://your-project-id.supabase.co',  -- ⚠️ REPLACE with your actual Supabase URL
  'your-anon-public-key-here',  -- ⚠️ REPLACE with your actual Supabase anon key
  'unknown',
  'OneApp Data',
  'Supabase database connection for OneApp shared database. This API manages all database operations including tables, backups, and data storage.',
  true,
  jsonb_build_object(
    'tool', 'Supabase',
    'version', '1.0.0',
    'created_via', 'manual_insert'
  )
);

-- Step 3: Verify the insert was successful
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

