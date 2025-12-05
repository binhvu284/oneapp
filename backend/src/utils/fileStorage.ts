import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Path to OneApp data folder
// Use process.cwd() which should point to project root in both localhost and Vercel
// In Vercel serverless functions, process.cwd() points to the function's working directory
// which should be the project root if configured correctly
const ONEAPP_DATA_DIR = path.resolve(process.cwd(), 'OneApp data')

/**
 * Get the full path to a JSON file in OneApp data folder
 */
function getDataFilePath(filename: string): string {
  return path.join(ONEAPP_DATA_DIR, filename)
}

/**
 * Try to find the data file by checking multiple possible paths
 */
async function findDataFile(filename: string): Promise<string | null> {
  const possiblePaths = [
    // From backend folder (when data is copied during build)
    path.resolve(process.cwd(), 'OneApp data', filename),
    // From compiled dist folder (Vercel/serverless - if deployed from project root)
    path.resolve(__dirname, '../../../..', 'OneApp data', filename),
    // From source folder (localhost development)
    path.resolve(__dirname, '../../..', 'OneApp data', filename),
    // From project root (if backend is deployed from root)
    path.resolve(process.cwd(), '..', 'OneApp data', filename),
    // From dist/utils folder (alternative serverless path)
    path.resolve(__dirname, '../../..', 'OneApp data', filename),
  ]

  for (const filePath of possiblePaths) {
    try {
      await fs.access(filePath)
      console.log(`[fileStorage] Found file at: ${filePath}`)
      return filePath
    } catch {
      // File doesn't exist at this path, try next
      continue
    }
  }

  return null
}

/**
 * Read JSON data from file
 */
export async function readJsonFile<T>(filename: string): Promise<T[]> {
  try {
    // Try to find the file using multiple path strategies
    const filePath = await findDataFile(filename)
    
    if (!filePath) {
      console.warn(`[fileStorage] File not found: ${filename}`)
      console.warn(`[fileStorage] __dirname: ${__dirname}`)
      console.warn(`[fileStorage] process.cwd(): ${process.cwd()}`)
      console.warn(`[fileStorage] Tried paths:`)
      console.warn(`  - ${path.resolve(__dirname, '../../../..', 'OneApp data', filename)}`)
      console.warn(`  - ${path.resolve(__dirname, '../../..', 'OneApp data', filename)}`)
      console.warn(`  - ${path.resolve(process.cwd(), 'OneApp data', filename)}`)
      console.warn(`  - ${path.resolve(process.cwd(), '..', 'OneApp data', filename)}`)
      return []
    }
    
    const data = await fs.readFile(filePath, 'utf-8')
    const parsed = JSON.parse(data) as T[]
    console.log(`[fileStorage] Successfully read ${parsed.length} records from ${filename}`)
    return parsed
  } catch (error: any) {
    console.error(`[fileStorage] Error reading ${filename}:`, error)
    throw error
  }
}

/**
 * Write JSON data to file
 */
export async function writeJsonFile<T>(filename: string, data: T[]): Promise<void> {
  try {
    // Try to find existing file to determine correct directory
    const existingFilePath = await findDataFile(filename)
    
    let targetDir: string
    if (existingFilePath) {
      // Use the directory of the existing file
      targetDir = path.dirname(existingFilePath)
    } else {
      // Try to find the directory by checking for other files
      const categoriesPath = await findDataFile('categories.json')
      if (categoriesPath) {
        targetDir = path.dirname(categoriesPath)
      } else {
        // Fallback to ONEAPP_DATA_DIR
        targetDir = ONEAPP_DATA_DIR
      }
    }
    
    // Ensure directory exists
    await fs.mkdir(targetDir, { recursive: true })
    
    const filePath = path.join(targetDir, filename)
    const jsonData = JSON.stringify(data, null, 2)
    await fs.writeFile(filePath, jsonData, 'utf-8')
    console.log(`[fileStorage] Successfully wrote ${data.length} records to ${filePath}`)
  } catch (error) {
    console.error(`[fileStorage] Error writing ${filename}:`, error)
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

