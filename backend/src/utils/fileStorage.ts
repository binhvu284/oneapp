import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Path to OneApp data folder (relative to backend root)
// From backend/src/utils -> backend -> project root -> OneApp data
const ONEAPP_DATA_DIR = path.resolve(__dirname, '../../..', 'OneApp data')

/**
 * Get the full path to a JSON file in OneApp data folder
 */
function getDataFilePath(filename: string): string {
  return path.join(ONEAPP_DATA_DIR, filename)
}

/**
 * Read JSON data from file
 */
export async function readJsonFile<T>(filename: string): Promise<T[]> {
  try {
    const filePath = getDataFilePath(filename)
    const data = await fs.readFile(filePath, 'utf-8')
    return JSON.parse(data) as T[]
  } catch (error: any) {
    // If file doesn't exist, return empty array
    if (error.code === 'ENOENT') {
      return []
    }
    console.error(`Error reading ${filename}:`, error)
    throw error
  }
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

