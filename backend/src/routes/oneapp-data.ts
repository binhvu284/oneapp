import { Router, Request, Response } from 'express'
import { readJsonFile } from '../utils/fileStorage'

const router = Router()

/**
 * @route   GET /api/oneapp-data/:tableName
 * @desc    Get table data from OneApp Database (JSON files)
 * @access  Public
 */
router.get('/:tableName', async (req: Request, res: Response) => {
  try {
    const { tableName } = req.params

    // Map table names to JSON file names
    const tableFileMap: Record<string, string> = {
      'categories': 'categories.json',
      'in_use_app': 'in_use_app.json',
    }

    const filename = tableFileMap[tableName]

    if (!filename) {
      return res.status(404).json({
        success: false,
        error: `Table "${tableName}" not found in OneApp Database`,
      })
    }

    // Read data from JSON file
    const data = await readJsonFile(filename)

    res.json({
      success: true,
      data,
    })
  } catch (error: any) {
    console.error(`Error fetching table data for ${req.params.tableName}:`, error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch table data',
    })
  }
})

/**
 * @route   GET /api/oneapp-data
 * @desc    Get all table names and record counts
 * @access  Public
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const tables = ['categories', 'in_use_app']
    const tableStats = await Promise.all(
      tables.map(async (tableName) => {
        const tableFileMap: Record<string, string> = {
          'categories': 'categories.json',
          'in_use_app': 'in_use_app.json',
        }
        const filename = tableFileMap[tableName]
        try {
          const data = await readJsonFile(filename)
          return {
            name: tableName,
            recordCount: data.length,
          }
        } catch {
          return {
            name: tableName,
            recordCount: 0,
          }
        }
      })
    )

    res.json({
      success: true,
      data: tableStats,
    })
  } catch (error: any) {
    console.error('Error fetching table stats:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch table stats',
    })
  }
})

export { router as oneappDataRoutes }

