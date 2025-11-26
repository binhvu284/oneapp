import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { createError } from './errorHandler'

export interface AuthRequest extends Request {
  user?: {
    id: string
    email: string
  }
}

export function authenticateToken(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Authentication token required',
    })
  }

  const jwtSecret = process.env.JWT_SECRET
  if (!jwtSecret) {
    throw createError('JWT_SECRET not configured', 500)
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as { id: string; email: string }
    req.user = decoded
    next()
  } catch (error) {
    return res.status(403).json({
      success: false,
      error: 'Invalid or expired token',
    })
  }
}

