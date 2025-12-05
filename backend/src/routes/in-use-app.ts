import { Router, Request, Response } from 'express'
import { readJsonFile, writeJsonFile } from '../utils/fileStorage'

const router = Router()

interface InUseApp {
  _id: string
  id: string
  name: string
  description: string
  shortDescription?: string
  path: string
  icon: string
  category: string
  tags?: string[]
  enabled: boolean
  featured?: boolean
  status: string
  appType: string
  appTypeCategory?: string
  homeSection?: string
  createDate?: string
  developer?: string
  publishDate?: string
  managementStatus?: string
  image?: string | null
  publisher?: string
  appSize?: string | null
  sourceCodeUrl?: string | null
  createdAt: string
  updatedAt: string
}

/**
 * @route   GET /api/in-use-app
 * @desc    Get all in-use apps
 * @access  Public
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const apps = await readJsonFile<InUseApp>('in_use_app.json')
    res.json({
      success: true,
      data: apps,
    })
  } catch (error: any) {
    console.error('Error fetching in-use apps:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch in-use apps',
    })
  }
})

/**
 * @route   GET /api/in-use-app/:id
 * @desc    Get a specific in-use app by ID
 * @access  Public
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const apps = await readJsonFile<InUseApp>('in_use_app.json')
    const app = apps.find(a => a.id === id || a._id === id)
    
    if (!app) {
      return res.status(404).json({
        success: false,
        error: 'App not found',
      })
    }

    res.json({
      success: true,
      data: app,
    })
  } catch (error: any) {
    console.error('Error fetching in-use app:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch in-use app',
    })
  }
})

/**
 * @route   PUT /api/in-use-app/:id
 * @desc    Update an in-use app
 * @access  Public
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const updates = req.body

    // Read all apps
    const apps = await readJsonFile<InUseApp>('in_use_app.json')
    const appIndex = apps.findIndex(a => a.id === id || a._id === id)

    if (appIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'App not found',
      })
    }

    // Check for duplicate path if path is being updated
    if (updates.path && updates.path !== apps[appIndex].path) {
      const duplicatePath = apps.find(
        (a, idx) => idx !== appIndex && a.path === updates.path
      )
      if (duplicatePath) {
        return res.status(400).json({
          success: false,
          error: `Path "${updates.path}" is already used by another app`,
        })
      }
    }

    // Update the app
    const updatedApp: InUseApp = {
      ...apps[appIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    }

    apps[appIndex] = updatedApp

    // Save to file
    await writeJsonFile('in_use_app.json', apps)

    res.json({
      success: true,
      data: updatedApp,
      message: 'App updated successfully',
    })
  } catch (error: any) {
    console.error('Error updating in-use app:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update in-use app',
    })
  }
})

export { router as inUseAppRoutes }

