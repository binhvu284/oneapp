import { Router, Request, Response } from 'express'
import { supabase } from '../utils/supabase'
import { authenticateToken, AuthRequest } from '../middleware/auth'
import { createError } from '../middleware/errorHandler'

const router = Router()

/**
 * @route   POST /api/auth/signup
 * @desc    Register a new user
 * @access  Public
 */
router.post('/signup', async (req: Request, res: Response) => {
  try {
    if (!supabase) {
      return res.status(503).json({
        success: false,
        error: 'Supabase is not configured. Please set up your environment variables.',
      })
    }

    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required',
      })
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message,
      })
    }

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        user: data.user,
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to create user',
    })
  }
})

/**
 * @route   POST /api/auth/signin
 * @desc    Authenticate user and return token
 * @access  Public
 */
router.post('/signin', async (req: Request, res: Response) => {
  try {
    if (!supabase) {
      return res.status(503).json({
        success: false,
        error: 'Supabase is not configured. Please set up your environment variables.',
      })
    }

    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required',
      })
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return res.status(401).json({
        success: false,
        error: error.message,
      })
    }

    // In a real implementation, you would generate a JWT token here
    // For now, we'll return the session data
    res.json({
      success: true,
      message: 'Authentication successful',
      data: {
        user: data.user,
        session: data.session,
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Authentication failed',
    })
  }
})

/**
 * @route   POST /api/auth/signout
 * @desc    Sign out user
 * @access  Private
 */
router.post('/signout', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!supabase) {
      return res.status(503).json({
        success: false,
        error: 'Supabase is not configured.',
      })
    }

    const { error } = await supabase.auth.signOut()

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message,
      })
    }

    res.json({
      success: true,
      message: 'Signed out successfully',
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Sign out failed',
    })
  }
})

/**
 * @route   GET /api/auth/me
 * @desc    Get current user
 * @access  Private
 */
router.get('/me', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    res.json({
      success: true,
      data: {
        user: req.user,
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get user',
    })
  }
})

export { router as authRoutes }

