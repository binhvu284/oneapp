import { Router, Request, Response } from 'express'

const router = Router()

/**
 * @route   GET /api/health
 * @desc    Health check endpoint
 * @access  Public
 */
router.get('/', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'OneApp API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  })
})

export { router as healthRoutes }

