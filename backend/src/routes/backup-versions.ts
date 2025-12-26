import { Router, Request, Response } from 'express'
import { supabase } from '../utils/supabase'
import { appendFile } from 'fs/promises'
import { join } from 'path'

const router = Router()

// Log file path - try multiple locations
function getLogPath(): string {
  const possiblePaths = [
    join(process.cwd(), '.cursor', 'debug.log'), // From project root
    join(process.cwd(), '..', '.cursor', 'debug.log'), // From backend folder
  ]
  // Return first path (will create directory if needed)
  return possiblePaths[0]
}
const LOG_PATH = getLogPath()

// Helper function to write debug logs
async function logDebug(location: string, message: string, data: any, hypothesisId: string) {
  try {
    const logEntry = JSON.stringify({
      location,
      message,
      data,
      timestamp: Date.now(),
      sessionId: 'debug-session',
      runId: 'run1',
      hypothesisId,
    }) + '\n'
    // Ensure directory exists
    const { mkdir } = await import('fs/promises')
    await mkdir(join(LOG_PATH, '..'), { recursive: true }).catch(() => {})
    await appendFile(LOG_PATH, logEntry).catch(() => {})
  } catch {}
}

/**
 * @route   GET /api/backup-versions
 * @desc    Get all backup versions
 * @access  Public (for now, can be changed to Private later)
 */
router.get('/', async (req: Request, res: Response) => {
  // #region agent log
  console.log('[DEBUG] Backup versions GET called', { supabaseConfigured: !!supabase })
  await logDebug('backup-versions.ts:43', 'Backup versions GET called', { supabaseConfigured: !!supabase }, 'D')
  // #endregion
  try {
    if (!supabase) {
      // #region agent log
      console.warn('[DEBUG] Supabase not configured - returning empty array')
      await logDebug('backup-versions.ts:50', 'Supabase not configured - returning empty array', {}, 'D')
      // #endregion
      // Return empty array instead of error for GET requests - allows page to load
      return res.json({
        success: true,
        data: [],
      })
    }

    // #region agent log
    console.log('[DEBUG] Querying backup_versions table')
    await logDebug('backup-versions.ts:59', 'Querying backup_versions table', {}, 'D')
    // #endregion
    const { data, error } = await supabase
      .from('backup_versions')
      .select('*')
      .order('created_at', { ascending: false })
    
    // #region agent log
    console.log('[DEBUG] Backup query result', { hasError: !!error, errorMessage: error?.message, dataLength: data?.length })
    await logDebug('backup-versions.ts:67', 'Backup query result', { hasError: !!error, errorMessage: error?.message, dataLength: data?.length }, 'D')
    // #endregion

    if (error) {
      throw error
    }

    res.json({
      success: true,
      data: data || [],
    })
  } catch (error: any) {
    // #region agent log
    console.error('[DEBUG] Error fetching backup versions:', error)
    await logDebug('backup-versions.ts:83', 'Backup versions error', { error: error.message, stack: error.stack, code: error.code }, 'E')
    // #endregion
    
    // Handle connection/timeout errors - usually means invalid Supabase URL
    if (error.message?.includes('fetch failed') || error.message?.includes('ConnectTimeoutError') || error.code === 'UND_ERR_CONNECT_TIMEOUT') {
      return res.status(503).json({
        success: false,
        error: 'Cannot connect to Supabase. Your SUPABASE_URL in .env appears to be invalid or unreachable. Please check:\n1. Your SUPABASE_URL is your actual project URL (not a placeholder like "abcdefghijklmnop.supabase.co")\n2. Get the correct URL from: https://app.supabase.com → Your Project → Settings → API → Project URL\n3. Make sure your Supabase project is active and not paused',
      })
    }
    
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch backup versions',
    })
  }
})

/**
 * @route   GET /api/backup-versions/current
 * @desc    Get current backup version
 * @access  Public (for now, can be changed to Private later)
 */
router.get('/current', async (req: Request, res: Response) => {
  // #region agent log
  console.log('[DEBUG] Backup versions GET /current called', { supabaseConfigured: !!supabase })
  await logDebug('backup-versions.ts:100', 'Backup versions GET /current called', { supabaseConfigured: !!supabase }, 'D')
  // #endregion
  try {
    if (!supabase) {
      // #region agent log
      console.warn('[DEBUG] Supabase not configured - returning null for current version')
      await logDebug('backup-versions.ts:104', 'Supabase not configured - returning null', {}, 'D')
      // #endregion
      // Return null instead of error for GET requests - allows page to load
      return res.json({
        success: true,
        data: null,
      })
    }

    const { data, error } = await supabase
      .from('backup_versions')
      .select('*')
      .eq('is_current', true)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw error
    }

    res.json({
      success: true,
      data: data || null,
    })
  } catch (error: any) {
    // #region agent log
    console.error('[DEBUG] Error fetching current backup version:', error)
    await logDebug('backup-versions.ts:123', 'Error fetching current backup version', { error: error.message, stack: error.stack }, 'E')
    // #endregion
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch current backup version',
    })
  }
})

/**
 * @route   POST /api/backup-versions
 * @desc    Create a new backup version
 * @access  Public (for now, can be changed to Private later)
 */
router.post('/', async (req: Request, res: Response) => {
  // #region agent log
  console.log('[DEBUG] Backup versions POST called', { supabaseConfigured: !!supabase, body: req.body })
  await logDebug('backup-versions.ts:136', 'Backup versions POST called', { supabaseConfigured: !!supabase, body: req.body }, 'F')
  // #endregion
  try {
    if (!supabase) {
      // #region agent log
      console.error('[DEBUG] Supabase not configured - cannot create backup')
      await logDebug('backup-versions.ts:139', 'Supabase not configured', {}, 'F')
      // #endregion
      return res.status(503).json({
        success: false,
        error: 'Supabase is not configured. To enable backups:\n1. Create a .env file in the backend folder\n2. Add SUPABASE_URL and SUPABASE_KEY (see SUPABASE_SETUP.md for detailed instructions)\n3. Restart the backend server',
      })
    }

    const { name, size, storage_url, description, metadata, is_current } = req.body

    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Backup name is required',
      })
    }

    // If this is set as current, unset all other current backups
    if (is_current) {
      await supabase
        .from('backup_versions')
        .update({ is_current: false })
        .eq('is_current', true)
    }

    const { data, error } = await supabase
      .from('backup_versions')
      .insert({
        name,
        size: size || 0,
        storage_url: storage_url || null,
        description: description || null,
        metadata: metadata || {},
        is_current: is_current || false,
      })
      .select()
      .single()

    if (error) {
      // #region agent log
      console.error('[DEBUG] Supabase insert error', { error: error.message, code: error.code, details: error.details })
      await logDebug('backup-versions.ts:175', 'Supabase insert error', { error: error.message, code: error.code, details: error.details }, 'F')
      // #endregion
      throw error
    }

    // #region agent log
    console.log('[DEBUG] Backup created successfully', { id: data.id, name: data.name })
    await logDebug('backup-versions.ts:179', 'Backup created successfully', { id: data.id, name: data.name }, 'F')
    // #endregion

    res.status(201).json({
      success: true,
      data,
    })
  } catch (error: any) {
    // #region agent log
    console.error('[DEBUG] Error creating backup version:', error)
    await logDebug('backup-versions.ts:196', 'Backup creation error', { error: error.message, stack: error.stack, code: error.code }, 'F')
    // #endregion
    
    // Handle connection/timeout errors
    if (error.message?.includes('fetch failed') || error.message?.includes('ConnectTimeoutError') || error.code === 'UND_ERR_CONNECT_TIMEOUT') {
      return res.status(503).json({
        success: false,
        error: 'Cannot connect to Supabase. Please check:\n1. Your SUPABASE_URL in .env file is correct (should be your actual project URL, not a placeholder like "abcdefghijklmnop.supabase.co")\n2. Your internet connection is working\n3. Your Supabase project is active\n\nTo get your correct Supabase URL:\n- Go to https://app.supabase.com\n- Select your project\n- Go to Settings → API\n- Copy the "Project URL"',
      })
    }
    
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create backup version',
    })
  }
})

/**
 * @route   PUT /api/backup-versions/:id/apply
 * @desc    Apply a backup version (set as current)
 * @access  Public (for now, can be changed to Private later)
 */
router.put('/:id/apply', async (req: Request, res: Response) => {
  try {
    if (!supabase) {
      return res.status(503).json({
        success: false,
        error: 'Supabase is not configured',
      })
    }

    const { id } = req.params

    // Unset all current backups
    await supabase
      .from('backup_versions')
      .update({ is_current: false })
      .eq('is_current', true)

    // Set this backup as current
    const { data, error } = await supabase
      .from('backup_versions')
      .update({ is_current: true, updated_at: new Date().toISOString() })
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
    console.error('Error applying backup version:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to apply backup version',
    })
  }
})

/**
 * @route   DELETE /api/backup-versions/:id
 * @desc    Delete a backup version
 * @access  Public (for now, can be changed to Private later)
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
      .from('backup_versions')
      .delete()
      .eq('id', id)

    if (error) {
      throw error
    }

    res.json({
      success: true,
      message: 'Backup version deleted successfully',
    })
  } catch (error: any) {
    console.error('Error deleting backup version:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete backup version',
    })
  }
})

export { router as backupVersionsRoutes }

