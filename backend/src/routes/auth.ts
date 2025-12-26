import { Router, Request, Response } from 'express'
import { supabase, supabaseAdmin } from '../utils/supabase'
import { authenticateToken, AuthRequest } from '../middleware/auth'
import { createError } from '../middleware/errorHandler'
import { hashPassword } from '../utils/password'
import { syncUserToOneAppUsers } from '../utils/userSync'

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

    const { email, password, name, inviteCode } = req.body

    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        error: 'Email, password, and name are required',
      })
    }

    // Create user in Supabase Auth
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

    if (!data.user) {
      return res.status(400).json({
        success: false,
        error: 'Failed to create user',
      })
    }

    // Auto-confirm user email if admin client is available (skip email verification)
    if (supabaseAdmin && data.user.id) {
      try {
        const { error: confirmError } = await supabaseAdmin.auth.admin.updateUserById(
          data.user.id,
          {
            email_confirm: true,
          }
        )
        if (confirmError) {
          console.warn('⚠️  Could not auto-confirm user email:', confirmError.message)
          // Don't fail signup if auto-confirmation fails, just log it
        } else {
          console.log('✅ User email auto-confirmed')
        }
      } catch (confirmErr: any) {
        console.warn('⚠️  Error during auto-confirmation:', confirmErr.message)
        // Don't fail signup if auto-confirmation fails
      }
    }

    // Hash password for storage in oneapp_users
    const passwordHash = await hashPassword(password)

    // Sync to oneapp_users table
    try {
      await syncUserToOneAppUsers(data.user.id, email, name, passwordHash)
      console.log('✅ User synced to oneapp_users table successfully')

      // Update invite_code if provided
      if (inviteCode) {
        const { error: inviteError } = await supabase
          .from('oneapp_users')
          .update({ invite_code: inviteCode })
          .eq('id', data.user.id)
        
        if (inviteError) {
          console.error('Error updating invite_code:', inviteError)
        }
      }
    } catch (syncError: any) {
      console.error('❌ Error syncing user to oneapp_users:', syncError)
      // Fail the signup if sync fails - user should be in both tables
      return res.status(500).json({
        success: false,
        error: `Failed to sync user to database: ${syncError.message}`,
      })
    }

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        user: data.user,
      },
    })
  } catch (error: any) {
    console.error('Signup error:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create user',
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

    if (!data.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication failed',
      })
    }

    // Update last_login in oneapp_users table
    try {
      await supabase
        .from('oneapp_users')
        .update({ last_login: new Date().toISOString() })
        .eq('email', email)

      // Sync user data if needed
      const { data: oneappUser } = await supabase
        .from('oneapp_users')
        .select('name')
        .eq('email', email)
        .single()

      if (!oneappUser) {
        // User exists in Supabase Auth but not in oneapp_users, sync it
        await syncUserToOneAppUsers(
          data.user.id,
          email,
          data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'User'
        )
      }
    } catch (syncError: any) {
      console.error('Error updating last_login:', syncError)
      // Don't fail the signin if sync fails
    }

    res.json({
      success: true,
      message: 'Authentication successful',
      data: {
        user: data.user,
        session: data.session,
      },
    })
  } catch (error: any) {
    console.error('Signin error:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Authentication failed',
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
 * @route   POST /api/auth/forgot-password
 * @desc    Send password reset email
 * @access  Public
 */
router.post('/forgot-password', async (req: Request, res: Response) => {
  try {
    if (!supabase) {
      return res.status(503).json({
        success: false,
        error: 'Supabase is not configured. Please set up your environment variables.',
      })
    }

    const { email } = req.body

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required',
      })
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password`,
    })

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message,
      })
    }

    res.json({
      success: true,
      message: 'Password reset email sent',
    })
  } catch (error: any) {
    console.error('Forgot password error:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to send password reset email',
    })
  }
})

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password
 * @access  Public
 */
router.post('/reset-password', async (req: Request, res: Response) => {
  try {
    if (!supabase) {
      return res.status(503).json({
        success: false,
        error: 'Supabase is not configured. Please set up your environment variables.',
      })
    }

    const { password, token } = req.body

    if (!password) {
      return res.status(400).json({
        success: false,
        error: 'Password is required',
      })
    }

    // Update password in Supabase Auth
    const { data, error } = await supabase.auth.updateUser({
      password,
    })

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message,
      })
    }

    if (!data.user) {
      return res.status(400).json({
        success: false,
        error: 'Failed to update password',
      })
    }

    // Update password hash in oneapp_users table
    const passwordHash = await hashPassword(password)
    await supabase
      .from('oneapp_users')
      .update({ password: passwordHash })
      .eq('email', data.user.email)

    res.json({
      success: true,
      message: 'Password reset successfully',
    })
  } catch (error: any) {
    console.error('Reset password error:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to reset password',
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

