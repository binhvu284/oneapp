-- Create ai_agents table for storing AI agent configurations
-- 
-- IMPORTANT: Two types of agents:
-- 1. DEFAULT MODELS (is_default=true): 
--    - Direct API connections to external services (Gemini, ChatGPT)
--    - Used to access external AI models directly
--    - NO memory/data storage (memory_enabled should be FALSE)
--    - Can be used for chatting like any other agent
--    - Example: Gemini API connection, ChatGPT API connection
--
-- 2. CUSTOM AGENTS (is_default=false):
--    - OneApp-specific agents with memory and data storage
--    - Store conversation history, context, and learned data
--    - memory_enabled should be TRUE
--    - Have memory/data stored in ai_agent_memory table
--    - Get smarter over time through stored interactions
--    - Example: Customer Support Agent, Code Assistant

CREATE TABLE IF NOT EXISTS public.ai_agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  model VARCHAR(100) NOT NULL, -- 'gemini', 'chatgpt', 'gemini-3', 'gpt-5', etc.
  model_provider VARCHAR(50), -- 'google', 'openai', etc.
  api_key TEXT, -- API key for default models (Gemini/ChatGPT), NULL for custom agents using default models
  description TEXT,
  is_default BOOLEAN NOT NULL DEFAULT FALSE, -- TRUE for default models (Gemini/ChatGPT), FALSE for custom agents
  is_active BOOLEAN NOT NULL DEFAULT FALSE,
  memory_enabled BOOLEAN NOT NULL DEFAULT FALSE, -- FALSE for default models, TRUE for custom agents
  memory_size_bytes BIGINT NOT NULL DEFAULT 0, -- Only used for custom agents
  memory_token_estimate INTEGER NOT NULL DEFAULT 0, -- Only used for custom agents
  knowledge_files JSONB DEFAULT '[]'::jsonb, -- Only used for custom agents
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Drop the unique index if it exists (in case of previous failed attempts)
DROP INDEX IF EXISTS public.idx_unique_default_model;

-- Clean up duplicate default models before creating unique index
-- Keep only the most recent one for each model/provider combination
DO $$
DECLARE
  duplicate_record RECORD;
  agent_ids UUID[];
BEGIN
  -- Find and delete duplicate default models, keeping the most recent one
  FOR duplicate_record IN
    SELECT 
      model, 
      COALESCE(model_provider, '') as model_provider,
      array_agg(id ORDER BY created_at DESC) as ids
    FROM public.ai_agents
    WHERE is_default = TRUE
    GROUP BY model, COALESCE(model_provider, '')
    HAVING COUNT(*) > 1
  LOOP
    agent_ids := duplicate_record.ids;
    -- Delete all but the first (most recent) ID
    IF array_length(agent_ids, 1) > 1 THEN
      DELETE FROM public.ai_agents
      WHERE id = ANY(agent_ids[2:array_length(agent_ids, 1)])
        AND is_default = TRUE;
    END IF;
  END LOOP;
END $$;

-- Unique constraint: Prevent duplicate default models (only one Gemini, one ChatGPT)
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_default_model 
  ON public.ai_agents(model, COALESCE(model_provider, '')) 
  WHERE is_default = TRUE;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_ai_agents_model ON public.ai_agents(model);
CREATE INDEX IF NOT EXISTS idx_ai_agents_model_provider ON public.ai_agents(model_provider);
CREATE INDEX IF NOT EXISTS idx_ai_agents_is_default ON public.ai_agents(is_default);
CREATE INDEX IF NOT EXISTS idx_ai_agents_is_active ON public.ai_agents(is_active);
CREATE INDEX IF NOT EXISTS idx_ai_agents_created_at ON public.ai_agents(created_at DESC);

-- Create trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_ai_agents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if it exists before creating
DROP TRIGGER IF EXISTS update_ai_agents_updated_at ON public.ai_agents;

CREATE TRIGGER update_ai_agents_updated_at 
  BEFORE UPDATE ON public.ai_agents
  FOR EACH ROW 
  EXECUTE FUNCTION update_ai_agents_updated_at();

-- Create ai_agent_memory table for storing custom agent memory/context
-- NOTE: This table is ONLY for custom agents (is_default=false)
-- Default models (Gemini/ChatGPT) do NOT store memory here
CREATE TABLE IF NOT EXISTS public.ai_agent_memory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID NOT NULL REFERENCES public.ai_agents(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  context JSONB DEFAULT '{}'::jsonb,
  importance_score DECIMAL(5, 2) NOT NULL DEFAULT 0.5,
  size_bytes BIGINT NOT NULL DEFAULT 0,
  token_estimate INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Note: Application logic should ensure only custom agents (is_default=false) have memory entries

-- Create ai_agent_data table for storing custom agent data/knowledge
-- This stores structured data that custom agents can learn from
CREATE TABLE IF NOT EXISTS public.ai_agent_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID NOT NULL REFERENCES public.ai_agents(id) ON DELETE CASCADE,
  data_type VARCHAR(50) NOT NULL, -- 'conversation', 'knowledge', 'preference', etc.
  data_content JSONB NOT NULL DEFAULT '{}'::jsonb,
  tags TEXT[] DEFAULT '{}',
  importance_score DECIMAL(5, 2) NOT NULL DEFAULT 0.5,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Note: Application logic should ensure only custom agents (is_default=false) have data entries

-- Create indexes for ai_agent_memory
CREATE INDEX IF NOT EXISTS idx_ai_agent_memory_agent_id ON public.ai_agent_memory(agent_id);
CREATE INDEX IF NOT EXISTS idx_ai_agent_memory_importance ON public.ai_agent_memory(importance_score DESC);
CREATE INDEX IF NOT EXISTS idx_ai_agent_memory_created_at ON public.ai_agent_memory(created_at DESC);

-- Create indexes for ai_agent_data
CREATE INDEX IF NOT EXISTS idx_ai_agent_data_agent_id ON public.ai_agent_data(agent_id);
CREATE INDEX IF NOT EXISTS idx_ai_agent_data_type ON public.ai_agent_data(data_type);
CREATE INDEX IF NOT EXISTS idx_ai_agent_data_tags ON public.ai_agent_data USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_ai_agent_data_created_at ON public.ai_agent_data(created_at DESC);

-- Create trigger for ai_agent_memory updated_at
-- Drop trigger if it exists before creating
DROP TRIGGER IF EXISTS update_ai_agent_memory_updated_at ON public.ai_agent_memory;

CREATE TRIGGER update_ai_agent_memory_updated_at 
  BEFORE UPDATE ON public.ai_agent_memory
  FOR EACH ROW 
  EXECUTE FUNCTION update_ai_agents_updated_at();

-- Create trigger for ai_agent_data updated_at
-- Drop trigger if it exists before creating
DROP TRIGGER IF EXISTS update_ai_agent_data_updated_at ON public.ai_agent_data;

CREATE TRIGGER update_ai_agent_data_updated_at 
  BEFORE UPDATE ON public.ai_agent_data
  FOR EACH ROW 
  EXECUTE FUNCTION update_ai_agents_updated_at();

