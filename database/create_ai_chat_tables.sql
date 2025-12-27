-- Create AI Chat tables for storing conversations, messages, and files
-- 
-- This schema is optimized for AI chat applications with the following features:
-- 1. Efficient conversation management with user and agent associations
-- 2. Message storage with role-based content (user/assistant/system)
-- 3. File attachment support for messages
-- 4. Token counting for cost tracking and API limits
-- 5. Pinned conversations for quick access
-- 6. Proper indexing for fast queries
-- 7. Soft delete support via deleted_at timestamp

-- ============================================================================
-- CONVERSATIONS TABLE
-- ============================================================================
-- Stores conversation metadata and settings
CREATE TABLE IF NOT EXISTS public.ai_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES public.ai_agents(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL DEFAULT 'New Conversation',
  pinned BOOLEAN NOT NULL DEFAULT FALSE,
  -- Token tracking for conversation context
  total_tokens INTEGER NOT NULL DEFAULT 0,
  message_count INTEGER NOT NULL DEFAULT 0,
  -- Conversation settings and metadata
  settings JSONB DEFAULT '{}'::jsonb, -- e.g., {"temperature": 0.7, "max_tokens": 2000}
  metadata JSONB DEFAULT '{}'::jsonb, -- Additional flexible data
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE NULL -- Soft delete support
);

-- ============================================================================
-- MESSAGES TABLE
-- ============================================================================
-- Stores individual messages within conversations
CREATE TABLE IF NOT EXISTS public.ai_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES public.ai_conversations(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  -- Token tracking for individual messages
  token_count INTEGER DEFAULT 0,
  -- Message metadata
  metadata JSONB DEFAULT '{}'::jsonb, -- e.g., {"model": "gpt-4", "finish_reason": "stop"}
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE NULL -- Soft delete support
);

-- ============================================================================
-- MESSAGE FILES TABLE
-- ============================================================================
-- Stores files attached to messages (images, documents, etc.)
CREATE TABLE IF NOT EXISTS public.ai_message_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id UUID NOT NULL REFERENCES public.ai_messages(id) ON DELETE CASCADE,
  file_id UUID REFERENCES public.files(id) ON DELETE SET NULL, -- Reference to files table
  -- File metadata (stored here for quick access, also in files table)
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(100), -- MIME type
  file_size BIGINT DEFAULT 0, -- Size in bytes
  file_url TEXT, -- Storage URL or path
  -- File processing status (for AI vision/document processing)
  processing_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  extracted_text TEXT, -- Extracted text from documents/images (for AI context)
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Conversations indexes
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_id ON public.ai_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_agent_id ON public.ai_conversations(agent_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_updated ON public.ai_conversations(user_id, updated_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_ai_conversations_pinned ON public.ai_conversations(user_id, pinned DESC, updated_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_ai_conversations_deleted_at ON public.ai_conversations(deleted_at) WHERE deleted_at IS NOT NULL;

-- Messages indexes
CREATE INDEX IF NOT EXISTS idx_ai_messages_conversation_id ON public.ai_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_ai_messages_conversation_created ON public.ai_messages(conversation_id, created_at ASC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_ai_messages_role ON public.ai_messages(role) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_ai_messages_deleted_at ON public.ai_messages(deleted_at) WHERE deleted_at IS NOT NULL;

-- Message files indexes
CREATE INDEX IF NOT EXISTS idx_ai_message_files_message_id ON public.ai_message_files(message_id);
CREATE INDEX IF NOT EXISTS idx_ai_message_files_file_id ON public.ai_message_files(file_id);

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT TIMESTAMPS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_ai_conversations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_ai_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop triggers if they exist
DROP TRIGGER IF EXISTS update_ai_conversations_updated_at ON public.ai_conversations;
DROP TRIGGER IF EXISTS update_ai_messages_updated_at ON public.ai_messages;

-- Create triggers
CREATE TRIGGER update_ai_conversations_updated_at
  BEFORE UPDATE ON public.ai_conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_conversations_updated_at();

CREATE TRIGGER update_ai_messages_updated_at
  BEFORE UPDATE ON public.ai_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_messages_updated_at();

-- ============================================================================
-- TRIGGER TO UPDATE CONVERSATION STATISTICS
-- ============================================================================
-- Automatically update conversation message_count and total_tokens when messages are added/updated/deleted

CREATE OR REPLACE FUNCTION update_conversation_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Increment message count and add tokens
    UPDATE public.ai_conversations
    SET 
      message_count = message_count + 1,
      total_tokens = total_tokens + COALESCE(NEW.token_count, 0),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.conversation_id;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Update token count difference if token_count changed
    IF OLD.token_count IS DISTINCT FROM NEW.token_count THEN
      UPDATE public.ai_conversations
      SET 
        total_tokens = total_tokens - COALESCE(OLD.token_count, 0) + COALESCE(NEW.token_count, 0),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = NEW.conversation_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrement message count and subtract tokens
    UPDATE public.ai_conversations
    SET 
      message_count = GREATEST(0, message_count - 1),
      total_tokens = GREATEST(0, total_tokens - COALESCE(OLD.token_count, 0)),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = OLD.conversation_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS update_conversation_stats_trigger ON public.ai_messages;

-- Create trigger
CREATE TRIGGER update_conversation_stats_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.ai_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_stats();

-- ============================================================================
-- TRIGGER TO UPDATE CONVERSATION TITLE FROM FIRST MESSAGE
-- ============================================================================
-- Automatically set conversation title from first user message if still "New Conversation"

CREATE OR REPLACE FUNCTION auto_update_conversation_title()
RETURNS TRIGGER AS $$
DECLARE
  current_title VARCHAR(255);
  first_user_message TEXT;
BEGIN
  -- Only process user messages
  IF NEW.role = 'user' THEN
    -- Get current conversation title
    SELECT title INTO current_title
    FROM public.ai_conversations
    WHERE id = NEW.conversation_id;
    
    -- If title is still default, update it from first message
    IF current_title = 'New Conversation' OR current_title IS NULL THEN
      -- Extract first 50 characters as title
      first_user_message := LEFT(TRIM(NEW.content), 50);
      IF LENGTH(TRIM(NEW.content)) > 50 THEN
        first_user_message := first_user_message || '...';
      END IF;
      
      UPDATE public.ai_conversations
      SET title = first_user_message
      WHERE id = NEW.conversation_id AND (title = 'New Conversation' OR title IS NULL);
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS auto_update_conversation_title_trigger ON public.ai_messages;

-- Create trigger
CREATE TRIGGER auto_update_conversation_title_trigger
  AFTER INSERT ON public.ai_messages
  FOR EACH ROW
  EXECUTE FUNCTION auto_update_conversation_title();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
-- Enable RLS on all tables
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_message_files ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own conversations
CREATE POLICY "Users can view their own conversations"
  ON public.ai_conversations FOR SELECT
  USING (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "Users can insert their own conversations"
  ON public.ai_conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations"
  ON public.ai_conversations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversations"
  ON public.ai_conversations FOR DELETE
  USING (auth.uid() = user_id);

-- Policy: Users can only access messages in their own conversations
CREATE POLICY "Users can view messages in their conversations"
  ON public.ai_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.ai_conversations
      WHERE ai_conversations.id = ai_messages.conversation_id
      AND ai_conversations.user_id = auth.uid()
      AND ai_conversations.deleted_at IS NULL
    )
    AND deleted_at IS NULL
  );

CREATE POLICY "Users can insert messages in their conversations"
  ON public.ai_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.ai_conversations
      WHERE ai_conversations.id = ai_messages.conversation_id
      AND ai_conversations.user_id = auth.uid()
      AND ai_conversations.deleted_at IS NULL
    )
  );

CREATE POLICY "Users can update messages in their conversations"
  ON public.ai_messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.ai_conversations
      WHERE ai_conversations.id = ai_messages.conversation_id
      AND ai_conversations.user_id = auth.uid()
      AND ai_conversations.deleted_at IS NULL
    )
  );

CREATE POLICY "Users can delete messages in their conversations"
  ON public.ai_messages FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.ai_conversations
      WHERE ai_conversations.id = ai_messages.conversation_id
      AND ai_conversations.user_id = auth.uid()
      AND ai_conversations.deleted_at IS NULL
    )
  );

-- Policy: Users can only access files in their own messages
CREATE POLICY "Users can view files in their messages"
  ON public.ai_message_files FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.ai_messages
      JOIN public.ai_conversations ON ai_conversations.id = ai_messages.conversation_id
      WHERE ai_messages.id = ai_message_files.message_id
      AND ai_conversations.user_id = auth.uid()
      AND ai_conversations.deleted_at IS NULL
      AND ai_messages.deleted_at IS NULL
    )
  );

CREATE POLICY "Users can insert files in their messages"
  ON public.ai_message_files FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.ai_messages
      JOIN public.ai_conversations ON ai_conversations.id = ai_messages.conversation_id
      WHERE ai_messages.id = ai_message_files.message_id
      AND ai_conversations.user_id = auth.uid()
      AND ai_conversations.deleted_at IS NULL
    )
  );

CREATE POLICY "Users can delete files in their messages"
  ON public.ai_message_files FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.ai_messages
      JOIN public.ai_conversations ON ai_conversations.id = ai_messages.conversation_id
      WHERE ai_messages.id = ai_message_files.message_id
      AND ai_conversations.user_id = auth.uid()
      AND ai_conversations.deleted_at IS NULL
    )
  );

