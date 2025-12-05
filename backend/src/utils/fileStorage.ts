import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/**
 * Get the project root directory where "OneApp data" folder is located
 * This function handles different deployment scenarios:
 * - Local development: process.cwd() = project root
 * - Vercel serverless: process.cwd() = project root (or backend root)
 * - Compiled code: __dirname = dist/utils/ -> need to go up to project root
 */
function getProjectRoot(): string {
  const cwd = process.cwd()
  
  // Strategy 1: Check if "OneApp data" exists in current directory
  try {
    const testPath = path.join(cwd, 'OneApp data')
    // We can't use fs.existsSync in async context, but we'll try to read later
    // For now, assume if cwd doesn't end with backend/dist, it's project root
    if (!cwd.includes('backend') && !cwd.includes('dist')) {
      return cwd
    }
  } catch {
    // Continue to other strategies
  }
  
  // Strategy 2: If we're in backend directory, go up one level
  if (cwd.endsWith('backend') || cwd.endsWith('backend/')) {
    return path.resolve(cwd, '..')
  }
  
  // Strategy 3: If we're in dist directory (compiled code)
  // From dist/utils/fileStorage.js -> dist -> backend -> project root
  if (cwd.includes('dist')) {
    // Remove dist and everything after it
    const backendRoot = cwd.replace(/[/\\]dist.*$/, '')
    // If backendRoot ends with backend, go up one more level
    if (backendRoot.endsWith('backend') || backendRoot.endsWith('backend/')) {
      return path.resolve(backendRoot, '..')
    }
    return backendRoot
  }
  
  // Strategy 4: Use __dirname for compiled code
  // From dist/utils/fileStorage.js -> dist -> backend -> project root
  if (__dirname.includes('dist')) {
    const distRoot = path.resolve(__dirname, '../..')
    const backendRoot = distRoot.replace(/[/\\]dist$/, '')
    if (backendRoot.endsWith('backend') || backendRoot.endsWith('backend/')) {
      return path.resolve(backendRoot, '..')
    }
    return backendRoot
  }
  
  // Default: assume current directory is project root
  return cwd
}

// Get the data directory path
const projectRoot = getProjectRoot()
const ONEAPP_DATA_DIR = path.join(projectRoot, 'OneApp data')

// Log for debugging (only in production to help diagnose issues)
if (process.env.NODE_ENV === 'production') {
  console.log(`[fileStorage] Project root: ${projectRoot}`)
  console.log(`[fileStorage] Data directory: ${ONEAPP_DATA_DIR}`)
  console.log(`[fileStorage] process.cwd(): ${process.cwd()}`)
  console.log(`[fileStorage] __dirname: ${__dirname}`)
}

/**
 * Get the full path to a JSON file in OneApp data folder
 */
function getDataFilePath(filename: string): string {
  return path.join(ONEAPP_DATA_DIR, filename)
}

/**
 * Read JSON data from file
 * Tries multiple path strategies to find the file
 */
export async function readJsonFile<T>(filename: string): Promise<T[]> {
  const pathsToTry = [
    getDataFilePath(filename), // Primary path
    path.join(process.cwd(), 'OneApp data', filename), // From project root
    path.join(process.cwd(), '..', 'OneApp data', filename), // If in backend directory
    path.resolve(__dirname, '../../..', 'OneApp data', filename), // From compiled dist
  ]
  
  for (const filePath of pathsToTry) {
    try {
      // Log for debugging in production
      if (process.env.NODE_ENV === 'production' && pathsToTry.indexOf(filePath) === 0) {
        console.log(`[fileStorage] Attempting to read: ${filePath}`)
        console.log(`[fileStorage] process.cwd(): ${process.cwd()}`)
        console.log(`[fileStorage] __dirname: ${__dirname}`)
      }
      
      const data = await fs.readFile(filePath, 'utf-8')
      
      if (process.env.NODE_ENV === 'production') {
        console.log(`[fileStorage] Successfully read file from: ${filePath}`)
      }
      
      return JSON.parse(data) as T[]
    } catch (error: any) {
      // If file doesn't exist, try next path
      if (error.code === 'ENOENT') {
        continue
      }
      // Other errors, log and continue to next path
      if (process.env.NODE_ENV === 'production') {
        console.warn(`[fileStorage] Error reading ${filePath}:`, error.message)
      }
      continue
    }
  }
  
  // If all paths failed, log and return empty array
  console.warn(`[fileStorage] File not found in any location: ${filename}`)
  console.warn(`[fileStorage] Tried paths:`, pathsToTry)
  return []
}

/**
 * Write JSON data to file
 */
export async function writeJsonFile<T>(filename: string, data: T[]): Promise<void> {
  try {
    // Ensure directory exists
    await fs.mkdir(ONEAPP_DATA_DIR, { recursive: true })
    
    const filePath = getDataFilePath(filename)
    const jsonData = JSON.stringify(data, null, 2)
    await fs.writeFile(filePath, jsonData, 'utf-8')
  } catch (error) {
    console.error(`Error writing ${filename}:`, error)
    throw error
  }
}

/**
 * Ensure data directory exists
 */
export async function ensureDataDirectory(): Promise<void> {
  try {
    await fs.mkdir(ONEAPP_DATA_DIR, { recursive: true })
  } catch (error) {
    console.error('Error creating data directory:', error)
    throw error
  }
}

