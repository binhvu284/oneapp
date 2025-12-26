import { Router, Request, Response } from 'express'
import { supabase } from '../utils/supabase'

const router = Router()

interface AIAgent {
  id?: string
  name: string
  avatar_url?: string
  model: string
  model_provider?: string
  api_key?: string
  description?: string
  is_default: boolean
  is_active: boolean
  memory_enabled: boolean
  memory_size_bytes: number
  memory_token_estimate: number
  knowledge_files?: any[]
  metadata?: Record<string, any>
}

interface AgentMemory {
  id?: string
  agent_id: string
  content: string
  context?: Record<string, any>
  importance_score: number
  size_bytes: number
  token_estimate: number
}

// Helper function to estimate tokens (approximate: 1 token ≈ 4 characters)
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4)
}

// Helper function to calculate size in bytes
function calculateSize(text: string): number {
  // Use Buffer in Node.js environment
  if (typeof Buffer !== 'undefined') {
    return Buffer.byteLength(text, 'utf8')
  }
  // Fallback for browser (approximate)
  return new TextEncoder().encode(text).length
}

/**
 * @route   GET /api/ai-agents
 * @desc    Get all AI agents (with optional filters)
 * @access  Public
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    if (!supabase) {
      return res.json({
        success: true,
        data: [],
      })
    }

    const { active, is_default } = req.query

    let query = supabase.from('ai_agents').select('*')

    if (active !== undefined) {
      query = query.eq('is_active', active === 'true')
    }
    if (is_default !== undefined) {
      query = query.eq('is_default', is_default === 'true')
    }

    const { data, error } = await query.order('is_default', { ascending: false }).order('created_at', { ascending: false })

    if (error) {
      if (error.code === 'PGRST116' || error.message?.includes('relation') || error.message?.includes('does not exist')) {
        return res.json({
          success: true,
          data: [],
        })
      }
      throw error
    }

    res.json({
      success: true,
      data: data || [],
    })
  } catch (error: any) {
    console.error('Error fetching AI agents:', error)
    res.json({
      success: true,
      data: [],
    })
  }
})

/**
 * @route   GET /api/ai-agents/:id
 * @desc    Get single AI agent by ID
 * @access  Public
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    if (!supabase) {
      return res.status(503).json({
        success: false,
        error: 'Supabase is not configured',
      })
    }

    const { id } = req.params

    const { data, error } = await supabase
      .from('ai_agents')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: 'Agent not found',
        })
      }
      throw error
    }

    res.json({
      success: true,
      data,
    })
  } catch (error: any) {
    console.error('Error fetching AI agent:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch agent',
    })
  }
})

/**
 * @route   POST /api/ai-agents
 * @desc    Create new custom AI agent
 * @access  Public
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    if (!supabase) {
      return res.status(503).json({
        success: false,
        error: 'Supabase is not configured',
      })
    }

    const { name, avatar_url, model, model_provider, description, memory_enabled, metadata } = req.body

    if (!name || !model) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name, model',
      })
    }

    const { data, error } = await supabase
      .from('ai_agents')
      .insert({
        name,
        avatar_url: avatar_url || null,
        model,
        model_provider: model_provider || null,
        description: description || null,
        is_default: false,
        is_active: false, // Custom agents start inactive until API key is set
        memory_enabled: memory_enabled !== undefined ? memory_enabled : true,
        memory_size_bytes: 0,
        memory_token_estimate: 0,
        knowledge_files: [],
        metadata: metadata || {},
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    res.json({
      success: true,
      data,
    })
  } catch (error: any) {
    console.error('Error creating AI agent:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create agent',
    })
  }
})

/**
 * @route   PUT /api/ai-agents/:id
 * @desc    Update AI agent
 * @access  Public
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    if (!supabase) {
      return res.status(503).json({
        success: false,
        error: 'Supabase is not configured',
      })
    }

    const { id } = req.params
    const { name, avatar_url, model, model_provider, description, memory_enabled, knowledge_files, metadata } = req.body

    // Check if agent exists and is not default (can't modify default agents' core properties)
    const { data: existingAgent } = await supabase
      .from('ai_agents')
      .select('is_default')
      .eq('id', id)
      .single()

    if (!existingAgent) {
      return res.status(404).json({
        success: false,
        error: 'Agent not found',
      })
    }

    const updateData: Partial<AIAgent> = {}
    if (name !== undefined) updateData.name = name
    if (avatar_url !== undefined) updateData.avatar_url = avatar_url
    if (model !== undefined && !existingAgent.is_default) updateData.model = model
    if (model_provider !== undefined) updateData.model_provider = model_provider
    if (description !== undefined) updateData.description = description
    if (memory_enabled !== undefined) updateData.memory_enabled = memory_enabled
    if (knowledge_files !== undefined) updateData.knowledge_files = knowledge_files
    if (metadata !== undefined) updateData.metadata = metadata

    const { data, error } = await supabase
      .from('ai_agents')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw error
    }

    res.json({
      success: true,
      data,
    })
  } catch (error: any) {
    console.error('Error updating AI agent:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update agent',
    })
  }
})

/**
 * @route   PUT /api/ai-agents/:id/api-key
 * @desc    Update API key for agent (mainly for default agents)
 * @access  Public
 */
router.put('/:id/api-key', async (req: Request, res: Response) => {
  try {
    if (!supabase) {
      return res.status(503).json({
        success: false,
        error: 'Supabase is not configured',
      })
    }

    const { id } = req.params
    const { api_key } = req.body

    if (api_key === undefined) {
      return res.status(400).json({
        success: false,
        error: 'api_key is required',
      })
    }

    const { data, error } = await supabase
      .from('ai_agents')
      .update({
        api_key: api_key || null,
        is_active: !!api_key, // Auto-activate if API key is provided
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: 'Agent not found',
        })
      }
      throw error
    }

    res.json({
      success: true,
      data,
    })
  } catch (error: any) {
    console.error('Error updating API key:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update API key',
    })
  }
})

/**
 * @route   PUT /api/ai-agents/:id/toggle
 * @desc    Toggle agent active status
 * @access  Public
 */
router.put('/:id/toggle', async (req: Request, res: Response) => {
  try {
    if (!supabase) {
      return res.status(503).json({
        success: false,
        error: 'Supabase is not configured',
      })
    }

    const { id } = req.params
    const { is_active } = req.body

    if (typeof is_active !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: 'is_active must be a boolean',
      })
    }

    // Check if agent has API key before allowing activation
    if (is_active) {
      const { data: agent } = await supabase
        .from('ai_agents')
        .select('api_key, is_default')
        .eq('id', id)
        .single()

      if (!agent) {
        return res.status(404).json({
          success: false,
          error: 'Agent not found',
        })
      }

      // Default agents need API key to be active
      if (agent.is_default && !agent.api_key) {
        return res.status(400).json({
          success: false,
          error: 'API key must be configured before activating default agent',
        })
      }
    }

    const { data, error } = await supabase
      .from('ai_agents')
      .update({ is_active })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw error
    }

    res.json({
      success: true,
      data,
    })
  } catch (error: any) {
    console.error('Error toggling agent:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to toggle agent',
    })
  }
})

/**
 * @route   POST /api/ai-agents/:id/test-connection
 * @desc    Test API connection for agent
 * @access  Public
 */
router.post('/:id/test-connection', async (req: Request, res: Response) => {
  try {
    if (!supabase) {
      return res.status(503).json({
        success: false,
        error: 'Supabase is not configured',
      })
    }

    const { id } = req.params

    const { data: agent, error: fetchError } = await supabase
      .from('ai_agents')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !agent) {
      return res.status(404).json({
        success: false,
        error: 'Agent not found',
      })
    }

    if (!agent.api_key) {
      return res.status(400).json({
        success: false,
        error: 'API key not configured',
      })
    }

    let testResult: { success: boolean; error?: string } = { success: false }

    try {
      if (agent.model === 'gemini' || agent.model_provider === 'google') {
        // Test Gemini API
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${agent.api_key}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: 'test' }] }],
          }),
          signal: AbortSignal.timeout(5000),
        })

        if (response.ok) {
          testResult = { success: true }
        } else {
          const errorData = await response.json().catch(() => ({}))
          testResult = { success: false, error: errorData.error?.message || `HTTP ${response.status}` }
        }
      } else if (agent.model === 'chatgpt' || agent.model_provider === 'openai') {
        // Test OpenAI API
        const response = await fetch('https://api.openai.com/v1/models', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${agent.api_key}`,
            'Content-Type': 'application/json',
          },
          signal: AbortSignal.timeout(5000),
        })

        if (response.ok) {
          testResult = { success: true }
        } else {
          const errorData = await response.json().catch(() => ({}))
          testResult = { success: false, error: errorData.error?.message || `HTTP ${response.status}` }
        }
      } else {
        testResult = { success: false, error: 'Unsupported model for testing' }
      }
    } catch (testError: any) {
      testResult = { success: false, error: testError.message || 'Connection test failed' }
    }

    // Update agent active status based on test result
    if (testResult.success) {
      await supabase
        .from('ai_agents')
        .update({ is_active: true })
        .eq('id', id)
    }

    res.json({
      success: true,
      testResult,
    })
  } catch (error: any) {
    console.error('Error testing connection:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to test connection',
    })
  }
})

/**
 * @route   DELETE /api/ai-agents/:id
 * @desc    Delete custom AI agent (not allowed for default agents)
 * @access  Public
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    if (!supabase) {
      return res.status(503).json({
        success: false,
        error: 'Supabase is not configured',
      })
    }

    const { id } = req.params

    // Check if agent is default (can't delete)
    const { data: agent } = await supabase
      .from('ai_agents')
      .select('is_default')
      .eq('id', id)
      .single()

    if (!agent) {
      return res.status(404).json({
        success: false,
        error: 'Agent not found',
      })
    }

    if (agent.is_default) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete default agents',
      })
    }

    const { error } = await supabase
      .from('ai_agents')
      .delete()
      .eq('id', id)

    if (error) {
      throw error
    }

    res.json({
      success: true,
      message: 'Agent deleted successfully',
    })
  } catch (error: any) {
    console.error('Error deleting agent:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete agent',
    })
  }
})

/**
 * @route   GET /api/ai-agents/:id/memory
 * @desc    Get agent memory entries
 * @access  Public
 */
router.get('/:id/memory', async (req: Request, res: Response) => {
  try {
    if (!supabase) {
      return res.json({
        success: true,
        data: [],
      })
    }

    const { id } = req.params
    const { importance_min, limit } = req.query

    let query = supabase
      .from('agent_memory')
      .select('*')
      .eq('agent_id', id)
      .order('importance_score', { ascending: false })
      .order('created_at', { ascending: false })

    if (importance_min) {
      query = query.gte('importance_score', parseInt(importance_min as string))
    }
    if (limit) {
      query = query.limit(parseInt(limit as string))
    }

    const { data, error } = await query

    if (error) {
      if (error.code === 'PGRST116' || error.message?.includes('relation') || error.message?.includes('does not exist')) {
        return res.json({
          success: true,
          data: [],
        })
      }
      throw error
    }

    res.json({
      success: true,
      data: data || [],
    })
  } catch (error: any) {
    console.error('Error fetching agent memory:', error)
    res.json({
      success: true,
      data: [],
    })
  }
})

/**
 * @route   POST /api/ai-agents/:id/memory
 * @desc    Add memory entry to agent
 * @access  Public
 */
router.post('/:id/memory', async (req: Request, res: Response) => {
  try {
    if (!supabase) {
      return res.status(503).json({
        success: false,
        error: 'Supabase is not configured',
      })
    }

    const { id } = req.params
    const { content, context, importance_score } = req.body

    if (!content) {
      return res.status(400).json({
        success: false,
        error: 'content is required',
      })
    }

    const sizeBytes = calculateSize(content)
    const tokenEstimate = estimateTokens(content)

    const { data: memory, error: memoryError } = await supabase
      .from('agent_memory')
      .insert({
        agent_id: id,
        content,
        context: context || {},
        importance_score: importance_score || 5,
        size_bytes: sizeBytes,
        token_estimate: tokenEstimate,
      })
      .select()
      .single()

    if (memoryError) {
      throw memoryError
    }

    // Update agent's total memory size and token estimate
    const { data: agent } = await supabase
      .from('ai_agents')
      .select('memory_size_bytes, memory_token_estimate')
      .eq('id', id)
      .single()

    if (agent) {
      await supabase
        .from('ai_agents')
        .update({
          memory_size_bytes: (agent.memory_size_bytes || 0) + sizeBytes,
          memory_token_estimate: (agent.memory_token_estimate || 0) + tokenEstimate,
        })
        .eq('id', id)
    }

    res.json({
      success: true,
      data: memory,
    })
  } catch (error: any) {
    console.error('Error adding memory:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to add memory',
    })
  }
})

/**
 * @route   PUT /api/ai-agents/:id/memory/:memoryId
 * @desc    Update memory entry
 * @access  Public
 */
router.put('/:id/memory/:memoryId', async (req: Request, res: Response) => {
  try {
    if (!supabase) {
      return res.status(503).json({
        success: false,
        error: 'Supabase is not configured',
      })
    }

    const { id, memoryId } = req.params
    const { content, context, importance_score } = req.body

    // Get existing memory to calculate size difference
    const { data: existingMemory } = await supabase
      .from('agent_memory')
      .select('size_bytes, token_estimate')
      .eq('id', memoryId)
      .eq('agent_id', id)
      .single()

    if (!existingMemory) {
      return res.status(404).json({
        success: false,
        error: 'Memory not found',
      })
    }

    const updateData: Partial<AgentMemory> = {}
    if (content !== undefined) {
      updateData.content = content
      updateData.size_bytes = calculateSize(content)
      updateData.token_estimate = estimateTokens(content)
    }
    if (context !== undefined) updateData.context = context
    if (importance_score !== undefined) updateData.importance_score = importance_score

    const { data, error } = await supabase
      .from('agent_memory')
      .update(updateData)
      .eq('id', memoryId)
      .eq('agent_id', id)
      .select()
      .single()

    if (error) {
      throw error
    }

    // Update agent's total memory if content changed
    if (content !== undefined && data) {
      const sizeDiff = data.size_bytes - existingMemory.size_bytes
      const tokenDiff = data.token_estimate - existingMemory.token_estimate

      const { data: agent } = await supabase
        .from('ai_agents')
        .select('memory_size_bytes, memory_token_estimate')
        .eq('id', id)
        .single()

      if (agent) {
        await supabase
          .from('ai_agents')
          .update({
            memory_size_bytes: (agent.memory_size_bytes || 0) + sizeDiff,
            memory_token_estimate: (agent.memory_token_estimate || 0) + tokenDiff,
          })
          .eq('id', id)
      }
    }

    res.json({
      success: true,
      data,
    })
  } catch (error: any) {
    console.error('Error updating memory:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update memory',
    })
  }
})

/**
 * @route   DELETE /api/ai-agents/:id/memory/:memoryId
 * @desc    Delete memory entry
 * @access  Public
 */
router.delete('/:id/memory/:memoryId', async (req: Request, res: Response) => {
  try {
    if (!supabase) {
      return res.status(503).json({
        success: false,
        error: 'Supabase is not configured',
      })
    }

    const { id, memoryId } = req.params

    // Get memory to calculate size for agent update
    const { data: memory } = await supabase
      .from('agent_memory')
      .select('size_bytes, token_estimate')
      .eq('id', memoryId)
      .eq('agent_id', id)
      .single()

    if (!memory) {
      return res.status(404).json({
        success: false,
        error: 'Memory not found',
      })
    }

    const { error } = await supabase
      .from('agent_memory')
      .delete()
      .eq('id', memoryId)
      .eq('agent_id', id)

    if (error) {
      throw error
    }

    // Update agent's total memory
    const { data: agent } = await supabase
      .from('ai_agents')
      .select('memory_size_bytes, memory_token_estimate')
      .eq('id', id)
      .single()

    if (agent) {
      await supabase
        .from('ai_agents')
        .update({
          memory_size_bytes: Math.max(0, (agent.memory_size_bytes || 0) - memory.size_bytes),
          memory_token_estimate: Math.max(0, (agent.memory_token_estimate || 0) - memory.token_estimate),
        })
        .eq('id', id)
    }

    res.json({
      success: true,
      message: 'Memory deleted successfully',
    })
  } catch (error: any) {
    console.error('Error deleting memory:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete memory',
    })
  }
})

/**
 * @route   GET /api/ai-agents/:id/memory/download
 * @desc    Download agent memory as JSON
 * @access  Public
 */
router.get('/:id/memory/download', async (req: Request, res: Response) => {
  try {
    if (!supabase) {
      return res.status(503).json({
        success: false,
        error: 'Supabase is not configured',
      })
    }

    const { id } = req.params

    const { data: memories, error } = await supabase
      .from('agent_memory')
      .select('*')
      .eq('agent_id', id)
      .order('importance_score', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Content-Disposition', `attachment; filename="agent-${id}-memory.json"`)
    res.json(memories || [])
  } catch (error: any) {
    console.error('Error downloading memory:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to download memory',
    })
  }
})

/**
 * @route   POST /api/ai-agents/:id/memory/upload
 * @desc    Upload/import memory from JSON file
 * @access  Public
 */
router.post('/:id/memory/upload', async (req: Request, res: Response) => {
  try {
    if (!supabase) {
      return res.status(503).json({
        success: false,
        error: 'Supabase is not configured',
      })
    }

    const { id } = req.params
    const { memories } = req.body // Array of memory objects

    if (!Array.isArray(memories)) {
      return res.status(400).json({
        success: false,
        error: 'memories must be an array',
      })
    }

    let totalSizeBytes = 0
    let totalTokens = 0

    const memoryEntries = memories.map((mem: any) => {
      const content = mem.content || ''
      const sizeBytes = calculateSize(content)
      const tokenEstimate = estimateTokens(content)
      totalSizeBytes += sizeBytes
      totalTokens += tokenEstimate

      return {
        agent_id: id,
        content,
        context: mem.context || {},
        importance_score: mem.importance_score || 5,
        size_bytes: sizeBytes,
        token_estimate: tokenEstimate,
      }
    })

    const { data, error } = await supabase
      .from('agent_memory')
      .insert(memoryEntries)
      .select()

    if (error) {
      throw error
    }

    // Update agent's total memory
    const { data: agent } = await supabase
      .from('ai_agents')
      .select('memory_size_bytes, memory_token_estimate')
      .eq('id', id)
      .single()

    if (agent) {
      await supabase
        .from('ai_agents')
        .update({
          memory_size_bytes: (agent.memory_size_bytes || 0) + totalSizeBytes,
          memory_token_estimate: (agent.memory_token_estimate || 0) + totalTokens,
        })
        .eq('id', id)
    }

    res.json({
      success: true,
      data: data || [],
      imported: memories.length,
    })
  } catch (error: any) {
    console.error('Error uploading memory:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to upload memory',
    })
  }
})

/**
 * @route   POST /api/ai-agents/:id/knowledge
 * @desc    Upload knowledge file for agent
 * @access  Public
 */
router.post('/:id/knowledge', async (req: Request, res: Response) => {
  try {
    if (!supabase) {
      return res.status(503).json({
        success: false,
        error: 'Supabase is not configured',
      })
    }

    const { id } = req.params
    const { file_name, file_url, file_size, file_type } = req.body

    if (!file_name || !file_url) {
      return res.status(400).json({
        success: false,
        error: 'file_name and file_url are required',
      })
    }

    // Get existing knowledge files
    const { data: agent } = await supabase
      .from('ai_agents')
      .select('knowledge_files')
      .eq('id', id)
      .single()

    if (!agent) {
      return res.status(404).json({
        success: false,
        error: 'Agent not found',
      })
    }

    const knowledgeFiles = Array.isArray(agent.knowledge_files) ? agent.knowledge_files : []
    const newFile = {
      id: Date.now().toString(),
      name: file_name,
      url: file_url,
      size: file_size || 0,
      type: file_type || 'unknown',
      uploaded_at: new Date().toISOString(),
    }

    knowledgeFiles.push(newFile)

    const { data, error } = await supabase
      .from('ai_agents')
      .update({ knowledge_files: knowledgeFiles })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw error
    }

    res.json({
      success: true,
      data: newFile,
    })
  } catch (error: any) {
    console.error('Error uploading knowledge file:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to upload knowledge file',
    })
  }
})

/**
 * @route   DELETE /api/ai-agents/:id/knowledge/:fileId
 * @desc    Delete knowledge file
 * @access  Public
 */
router.delete('/:id/knowledge/:fileId', async (req: Request, res: Response) => {
  try {
    if (!supabase) {
      return res.status(503).json({
        success: false,
        error: 'Supabase is not configured',
      })
    }

    const { id, fileId } = req.params

    const { data: agent } = await supabase
      .from('ai_agents')
      .select('knowledge_files')
      .eq('id', id)
      .single()

    if (!agent) {
      return res.status(404).json({
        success: false,
        error: 'Agent not found',
      })
    }

    const knowledgeFiles = Array.isArray(agent.knowledge_files) ? agent.knowledge_files : []
    const filteredFiles = knowledgeFiles.filter((file: any) => file.id !== fileId)

    const { data, error } = await supabase
      .from('ai_agents')
      .update({ knowledge_files: filteredFiles })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw error
    }

    res.json({
      success: true,
      message: 'Knowledge file deleted successfully',
    })
  } catch (error: any) {
    console.error('Error deleting knowledge file:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete knowledge file',
    })
  }
})

export { router as aiAgentsRoutes }

