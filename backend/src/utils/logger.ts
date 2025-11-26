/**
 * Simple logger utility
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug'

const colors = {
  info: '\x1b[36m', // Cyan
  warn: '\x1b[33m', // Yellow
  error: '\x1b[31m', // Red
  debug: '\x1b[35m', // Magenta
  reset: '\x1b[0m',
}

export const logger = {
  info: (message: string, ...args: unknown[]) => {
    log('info', message, ...args)
  },
  warn: (message: string, ...args: unknown[]) => {
    log('warn', message, ...args)
  },
  error: (message: string, ...args: unknown[]) => {
    log('error', message, ...args)
  },
  debug: (message: string, ...args: unknown[]) => {
    if (process.env.NODE_ENV === 'development') {
      log('debug', message, ...args)
    }
  },
}

function log(level: LogLevel, message: string, ...args: unknown[]) {
  const timestamp = new Date().toISOString()
  const color = colors[level]
  const reset = colors.reset
  const prefix = `${color}[${level.toUpperCase()}]${reset} ${timestamp}`

  console.log(prefix, message, ...args)
}

