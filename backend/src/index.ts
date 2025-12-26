import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { errorHandler } from './middleware/errorHandler'
import { authRoutes } from './routes/auth'
import { aiRoutes } from './routes/ai'
import { moduleRoutes } from './routes/modules'
import { taskRoutes } from './routes/tasks'
import { healthRoutes } from './routes/health'
import { categoryRoutes } from './routes/categories'
import { oneappDataRoutes } from './routes/oneapp-data'
import { inUseAppRoutes } from './routes/in-use-app'
import { backupVersionsRoutes } from './routes/backup-versions'
import { schemaRoutes } from './routes/schema'
import { apiRoutes } from './routes/apis'
import { aiAgentsRoutes } from './routes/ai-agents'

// Load environment variables
const envResult = dotenv.config()
if (envResult.error) {
  console.warn('⚠️  Warning: Could not load .env file:', envResult.error.message)
  console.warn('   Make sure .env file exists in the backend folder')
} else {
  console.log('✅ Environment variables loaded from .env file')
}

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`)
  next()
})

// Routes
app.use('/api/health', healthRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/ai', aiRoutes)
app.use('/api/modules', moduleRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/oneapp-data', oneappDataRoutes)
app.use('/api/in-use-app', inUseAppRoutes)
app.use('/api/backup-versions', backupVersionsRoutes)
app.use('/api/schema', schemaRoutes)
app.use('/api/apis', apiRoutes)
app.use('/api/ai-agents', aiAgentsRoutes)

// Error handling middleware (must be last)
app.use(errorHandler)

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`)
})

export default app

