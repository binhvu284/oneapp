import { Router, Request, Response } from 'express'
import { readFile, appendFile } from 'fs/promises'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const router = Router()

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

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
 * @route   GET /api/schema
 * @desc    Get database schema SQL
 * @access  Public
 */
router.get('/', async (req: Request, res: Response) => {
  // #region agent log
  console.log('[DEBUG] Schema route called', { cwd: process.cwd(), dirname: __dirname, filename: __filename })
  await logDebug('schema.ts:36', 'Schema route called', { cwd: process.cwd(), dirname: __dirname, filename: __filename }, 'A')
  // #endregion
  try {
    // Read schema.sql file - try multiple possible paths
    // Strategy: Try paths relative to different starting points
    const cwd = process.cwd()
    const possiblePaths = [
      // Strategy 1: From project root (when running from root with tsx)
      join(cwd, 'database', 'schema.sql'),
      // Strategy 2: From backend folder (going up one level to project root)
      join(cwd, '..', 'database', 'schema.sql'),
      // Strategy 3: From compiled dist folder (various depths)
      join(__dirname, '..', '..', '..', 'database', 'schema.sql'), // dist/routes -> dist -> project root
      join(__dirname, '..', '..', 'database', 'schema.sql'), // dist/src/routes -> dist/src -> dist -> project root
      join(__dirname, '..', '..', '..', '..', 'database', 'schema.sql'), // Deeper nesting
      join(__dirname, '..', '..', '..', '..', '..', 'database', 'schema.sql'), // Even deeper
      // Strategy 4: Absolute path resolution from __dirname
      join(__dirname.split('routes')[0], '..', 'database', 'schema.sql'), // Go up from routes to src, then to root
    ]
    
    // #region agent log
    console.log('[DEBUG] Trying schema paths', { paths: possiblePaths })
    await logDebug('schema.ts:50', 'Trying schema paths', { paths: possiblePaths }, 'C')
    // #endregion
    
    let schemaContent = ''
    let found = false
    let lastError: any = null
    
    for (const schemaPath of possiblePaths) {
      try {
        // #region agent log
        console.log('[DEBUG] Attempting to read schema file', { path: schemaPath })
        await logDebug('schema.ts:60', 'Attempting to read schema file', { path: schemaPath }, 'C')
        // #endregion
        schemaContent = await readFile(schemaPath, 'utf-8')
        found = true
        console.log(`[schema] Found schema file at: ${schemaPath}`)
        // #region agent log
        console.log('[DEBUG] Schema file found', { path: schemaPath, contentLength: schemaContent.length })
        await logDebug('schema.ts:66', 'Schema file found', { path: schemaPath, contentLength: schemaContent.length }, 'C')
        // #endregion
        break
      } catch (error: any) {
        lastError = error
        // #region agent log
        console.log('[DEBUG] Schema path failed', { path: schemaPath, error: error.message, code: error.code })
        await logDebug('schema.ts:73', 'Schema path failed', { path: schemaPath, error: error.message, code: error.code }, 'C')
        // #endregion
        // Try next path
        continue
      }
    }
    
    if (!found) {
      // #region agent log
      console.error('[DEBUG] Schema file not found', { lastError: lastError?.message, stack: lastError?.stack })
      await logDebug('schema.ts:81', 'Schema file not found', { lastError: lastError?.message, stack: lastError?.stack }, 'C')
      // #endregion
      throw new Error('Schema file not found in any expected location')
    }

    res.json({
      success: true,
      data: {
        sql: schemaContent,
      },
    })
  } catch (error: any) {
    // #region agent log
    console.error('[DEBUG] Error reading schema file:', error)
    await logDebug('schema.ts:92', 'Schema route error', { error: error.message, stack: error.stack }, 'E')
    // #endregion
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to read schema file',
    })
  }
})

export { router as schemaRoutes }

