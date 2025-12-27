-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.ai_agent_data (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  agent_id uuid NOT NULL,
  data_type character varying NOT NULL,
  data_content jsonb NOT NULL DEFAULT '{}'::jsonb,
  tags ARRAY DEFAULT '{}'::text[],
  importance_score numeric NOT NULL DEFAULT 0.5,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT ai_agent_data_pkey PRIMARY KEY (id),
  CONSTRAINT ai_agent_data_agent_id_fkey FOREIGN KEY (agent_id) REFERENCES public.ai_agents(id)
);
CREATE TABLE public.ai_agent_memory (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  agent_id uuid NOT NULL,
  content text NOT NULL,
  context jsonb DEFAULT '{}'::jsonb,
  importance_score numeric NOT NULL DEFAULT 0.5,
  size_bytes bigint NOT NULL DEFAULT 0,
  token_estimate integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT ai_agent_memory_pkey PRIMARY KEY (id),
  CONSTRAINT ai_agent_memory_agent_id_fkey FOREIGN KEY (agent_id) REFERENCES public.ai_agents(id)
);
CREATE TABLE public.ai_agents (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name character varying NOT NULL,
  avatar_url text,
  model character varying NOT NULL,
  model_provider character varying,
  api_key text,
  description text,
  is_default boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT false,
  memory_enabled boolean NOT NULL DEFAULT true,
  memory_size_bytes bigint NOT NULL DEFAULT 0,
  memory_token_estimate integer NOT NULL DEFAULT 0,
  knowledge_files jsonb DEFAULT '[]'::jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT ai_agents_pkey PRIMARY KEY (id)
);
CREATE TABLE public.ai_conversations (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  agent_id uuid,
  title character varying NOT NULL DEFAULT 'New Conversation',
  pinned boolean NOT NULL DEFAULT false,
  total_tokens integer NOT NULL DEFAULT 0,
  message_count integer NOT NULL DEFAULT 0,
  settings jsonb DEFAULT '{}'::jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  deleted_at timestamp with time zone,
  CONSTRAINT ai_conversations_pkey PRIMARY KEY (id),
  CONSTRAINT ai_conversations_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT ai_conversations_agent_id_fkey FOREIGN KEY (agent_id) REFERENCES public.ai_agents(id)
);
CREATE TABLE public.ai_interactions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  role character varying NOT NULL CHECK (role::text = ANY (ARRAY['user'::character varying, 'assistant'::character varying]::text[])),
  content text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT ai_interactions_pkey PRIMARY KEY (id),
  CONSTRAINT ai_interactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.ai_message_files (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  message_id uuid NOT NULL,
  file_id uuid,
  file_name character varying NOT NULL,
  file_type character varying,
  file_size bigint DEFAULT 0,
  file_url text,
  processing_status character varying DEFAULT 'pending',
  extracted_text text,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT ai_message_files_pkey PRIMARY KEY (id),
  CONSTRAINT ai_message_files_message_id_fkey FOREIGN KEY (message_id) REFERENCES public.ai_messages(id),
  CONSTRAINT ai_message_files_file_id_fkey FOREIGN KEY (file_id) REFERENCES public.files(id)
);
CREATE TABLE public.ai_messages (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  conversation_id uuid NOT NULL,
  role character varying NOT NULL CHECK (role::text = ANY (ARRAY['user'::character varying, 'assistant'::character varying, 'system'::character varying]::text[])),
  content text NOT NULL,
  token_count integer DEFAULT 0,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  deleted_at timestamp with time zone,
  CONSTRAINT ai_messages_pkey PRIMARY KEY (id),
  CONSTRAINT ai_messages_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.ai_conversations(id)
);
CREATE TABLE public.analytics (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  event_type character varying NOT NULL,
  module_id uuid,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT analytics_pkey PRIMARY KEY (id),
  CONSTRAINT analytics_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT analytics_module_id_fkey FOREIGN KEY (module_id) REFERENCES public.modules(id)
);
CREATE TABLE public.apis (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name character varying NOT NULL,
  type character varying NOT NULL,
  api_url text NOT NULL,
  api_key text NOT NULL,
  status character varying NOT NULL DEFAULT 'unknown'::character varying CHECK (status::text = ANY (ARRAY['connected'::character varying, 'disconnected'::character varying, 'error'::character varying, 'unknown'::character varying]::text[])),
  last_checked timestamp with time zone,
  app_source character varying,
  description text,
  enabled boolean DEFAULT true,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT apis_pkey PRIMARY KEY (id)
);
CREATE TABLE public.backup_versions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name character varying NOT NULL,
  size bigint NOT NULL,
  storage_url text,
  description text,
  is_current boolean DEFAULT false,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT backup_versions_pkey PRIMARY KEY (id)
);
CREATE TABLE public.files (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  name character varying NOT NULL,
  path text NOT NULL,
  size bigint NOT NULL,
  mime_type character varying,
  storage_url text,
  category character varying,
  tags ARRAY,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT files_pkey PRIMARY KEY (id),
  CONSTRAINT files_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.module_config (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  module_id uuid NOT NULL,
  config jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT module_config_pkey PRIMARY KEY (id),
  CONSTRAINT module_config_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT module_config_module_id_fkey FOREIGN KEY (module_id) REFERENCES public.modules(id)
);
CREATE TABLE public.modules (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name character varying NOT NULL UNIQUE,
  description text,
  status character varying NOT NULL DEFAULT 'pending'::character varying CHECK (status::text = ANY (ARRAY['active'::character varying, 'inactive'::character varying, 'pending'::character varying]::text[])),
  icon character varying,
  version character varying DEFAULT '1.0.0'::character varying,
  dependencies ARRAY,
  config jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT modules_pkey PRIMARY KEY (id)
);
CREATE TABLE public.oneapp_users (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name character varying NOT NULL,
  email character varying NOT NULL UNIQUE,
  phone character varying,
  user_data jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  password text,
  CONSTRAINT oneapp_users_pkey PRIMARY KEY (id)
);
CREATE TABLE public.tasks (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  title character varying NOT NULL,
  description text,
  status character varying NOT NULL DEFAULT 'pending'::character varying CHECK (status::text = ANY (ARRAY['pending'::character varying, 'in-progress'::character varying, 'completed'::character varying, 'cancelled'::character varying]::text[])),
  priority character varying NOT NULL DEFAULT 'medium'::character varying CHECK (priority::text = ANY (ARRAY['low'::character varying, 'medium'::character varying, 'high'::character varying]::text[])),
  due_date timestamp with time zone,
  completed_at timestamp with time zone,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT tasks_pkey PRIMARY KEY (id),
  CONSTRAINT tasks_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);