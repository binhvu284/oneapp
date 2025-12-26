import { Router, Request, Response } from 'express'
import { supabase } from '../utils/supabase'

const router = Router()

interface ApiConfig {
  id?: string
  name: string
  type: string
  api_url: string
  api_key: string
  status: 'connected' | 'disconnected' | 'error' | 'unknown'
  last_checked?: string
  app_source?: string
  description?: string
  enabled: boolean
  metadata?: Record<string, any>
}

/**
 * @route   GET /api/apis
 * @desc    Get all APIs with optional filters
 * @access  Public
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    if (!supabase) {
      // Return empty array when Supabase is not configured (allows page to load)
      return res.json({
        success: true,
        data: [],
      })
    }

    const { type, app_source, status, enabled } = req.query

    let query = supabase.from('apis').select('*')

    if (type) {
      query = query.eq('type', type as string)
    }
    if (app_source) {
      query = query.eq('app_source', app_source as string)
    }
    if (status) {
      query = query.eq('status', status as string)
    }
    if (enabled !== undefined) {
      query = query.eq('enabled', enabled === 'true')
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
      // Handle case where table doesn't exist yet (PGRST116 = relation does not exist)
      if (error.code === 'PGRST116' || error.message?.includes('relation') || error.message?.includes('does not exist')) {
        console.warn('APIs table does not exist yet. Returning empty array.')
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
    console.error('Error fetching APIs:', error)
    // Return empty array instead of error to allow page to load
    // The frontend can show a message if needed
    res.json({
      success: true,
      data: [],
    })
  }
})

/**
 * @route   GET /api/apis/:id
 * @desc    Get single API by ID
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
      .from('apis')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: 'API not found',
        })
      }
      throw error
    }

    res.json({
      success: true,
      data,
    })
  } catch (error: any) {
    console.error('Error fetching API:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch API',
    })
  }
})

/**
 * @route   POST /api/apis
 * @desc    Create new API
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

    const { name, type, api_url, api_key, app_source, description, enabled, metadata } = req.body

    if (!name || !type || !api_url || !api_key) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name, type, api_url, api_key',
      })
    }

    const { data, error } = await supabase
      .from('apis')
      .insert({
        name,
        type,
        api_url,
        api_key,
        status: 'unknown',
        app_source: app_source || null,
        description: description || null,
        enabled: enabled !== undefined ? enabled : true,
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
    console.error('Error creating API:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create API',
    })
  }
})

/**
 * @route   PUT /api/apis/:id
 * @desc    Update API configuration
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
    const { name, type, api_url, api_key, app_source, description, enabled, metadata } = req.body

    const updateData: Partial<ApiConfig> = {}
    if (name !== undefined) updateData.name = name
    if (type !== undefined) updateData.type = type
    if (api_url !== undefined) updateData.api_url = api_url
    if (api_key !== undefined) updateData.api_key = api_key
    if (app_source !== undefined) updateData.app_source = app_source
    if (description !== undefined) updateData.description = description
    if (enabled !== undefined) updateData.enabled = enabled
    if (metadata !== undefined) updateData.metadata = metadata

    const { data, error } = await supabase
      .from('apis')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: 'API not found',
        })
      }
      throw error
    }

    res.json({
      success: true,
      data,
    })
  } catch (error: any) {
    console.error('Error updating API:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update API',
    })
  }
})

/**
 * @route   DELETE /api/apis/:id
 * @desc    Delete API
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

    const { error } = await supabase
      .from('apis')
      .delete()
      .eq('id', id)

    if (error) {
      throw error
    }

    res.json({
      success: true,
      message: 'API deleted successfully',
    })
  } catch (error: any) {
    console.error('Error deleting API:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete API',
    })
  }
})

/**
 * @route   POST /api/apis/:id/test
 * @desc    Test API connection
 * @access  Public
 */
router.post('/:id/test', async (req: Request, res: Response) => {
  try {
    if (!supabase) {
      return res.status(503).json({
        success: false,
        error: 'Supabase is not configured',
      })
    }

    const { id } = req.params

    // Get API config
    const { data: apiData, error: fetchError } = await supabase
      .from('apis')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !apiData) {
      return res.status(404).json({
        success: false,
        error: 'API not found',
      })
    }

    let testStatus: 'connected' | 'disconnected' | 'error' = 'error'
    let testError: string | null = null

    try {
      // Test connection based on API type
      if (apiData.type === 'Database' && apiData.api_url.includes('supabase')) {
        // Test Supabase connection
        const { createClient } = await import('@supabase/supabase-js')
        const testClient = createClient(apiData.api_url, apiData.api_key)
        const { error: testError } = await testClient.from('oneapp_users').select('count').limit(1)
        
        if (testError) {
          testStatus = 'error'
          testError = testError.message
        } else {
          testStatus = 'connected'
        }
      } else if (apiData.type === 'REST' || apiData.type === 'GraphQL') {
        // Test REST/GraphQL API with a simple GET request
        const testUrl = apiData.api_url.endsWith('/') ? apiData.api_url.slice(0, -1) : apiData.api_url
        const healthUrl = `${testUrl}/health` || `${testUrl}/status` || testUrl
        
        try {
          const response = await fetch(healthUrl, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${apiData.api_key}`,
              'Content-Type': 'application/json',
            },
            signal: AbortSignal.timeout(5000), // 5 second timeout
          })
          
          if (response.ok) {
            testStatus = 'connected'
          } else {
            testStatus = 'error'
            testError = `HTTP ${response.status}: ${response.statusText}`
          }
        } catch (fetchErr: any) {
          testStatus = 'error'
          testError = fetchErr.message || 'Connection failed'
        }
      } else {
        // For other types, mark as unknown/error
        testStatus = 'error'
        testError = 'Unsupported API type for testing'
      }
    } catch (testErr: any) {
      testStatus = 'error'
      testError = testErr.message || 'Test failed'
    }

    // Update API status
    const { data: updatedData, error: updateError } = await supabase
      .from('apis')
      .update({
        status: testStatus,
        last_checked: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      throw updateError
    }

    res.json({
      success: true,
      data: updatedData,
      testResult: {
        status: testStatus,
        error: testError,
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error: any) {
    console.error('Error testing API:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to test API',
    })
  }
})

/**
 * @route   PUT /api/apis/:id/toggle
 * @desc    Enable/disable API
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
    const { enabled } = req.body

    if (typeof enabled !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: 'enabled must be a boolean',
      })
    }

    const { data, error } = await supabase
      .from('apis')
      .update({ enabled })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: 'API not found',
        })
      }
      throw error
    }

    res.json({
      success: true,
      data,
    })
  } catch (error: any) {
    console.error('Error toggling API:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to toggle API',
    })
  }
})

/**
 * @route   POST /api/apis/sync
 * @desc    Sync APIs from other apps (OneApp Data, etc.)
 * @access  Public
 */
router.post('/sync', async (req: Request, res: Response) => {
  try {
    if (!supabase) {
      return res.status(503).json({
        success: false,
        error: 'Supabase is not configured',
      })
    }

    const { source } = req.body // 'oneapp-data', 'ai-assistant', etc.
    const syncedApis: any[] = []

    if (source === 'oneapp-data') {
      // Sync Supabase API from OneApp Data
      // Note: Backend should use SUPABASE_URL, not VITE_SUPABASE_URL (which is frontend-only)
      const supabaseUrl = process.env.SUPABASE_URL
      const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY

      if (supabaseUrl && supabaseKey) {
        // Check if API already exists
        const { data: existing } = await supabase
          .from('apis')
          .select('*')
          .eq('app_source', 'OneApp Data')
          .eq('type', 'Database')
          .single()

        const apiData = {
          name: 'Supabase Database',
          type: 'Database',
          api_url: supabaseUrl,
          api_key: supabaseKey,
          status: 'unknown' as const,
          app_source: 'OneApp Data',
          description: 'Supabase database connection from OneApp Data',
          enabled: true,
          metadata: {
            tool: 'Supabase',
            synced_at: new Date().toISOString(),
          },
        }

        if (existing) {
          // Update existing
          const { data, error } = await supabase
            .from('apis')
            .update(apiData)
            .eq('id', existing.id)
            .select()
            .single()

          if (error) throw error
          syncedApis.push(data)
        } else {
          // Create new
          const { data, error } = await supabase
            .from('apis')
            .insert(apiData)
            .select()
            .single()

          if (error) throw error
          syncedApis.push(data)
        }
      }
    }

    res.json({
      success: true,
      data: syncedApis,
      message: `Synced ${syncedApis.length} API(s) from ${source}`,
    })
  } catch (error: any) {
    console.error('Error syncing APIs:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to sync APIs',
    })
  }
})

export { router as apiRoutes }

