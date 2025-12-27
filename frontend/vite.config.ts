import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'automatic',
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Don't split React - keep it in main bundle to ensure it loads first
          // This prevents "createContext is undefined" errors
          if (id.includes('node_modules')) {
            // Keep React and React-DOM in main bundle (don't split them)
            if (id.includes('react') || id.includes('react-dom')) {
              return undefined // Keep in main bundle
            }
            if (id.includes('react-router')) {
              return 'react-router-vendor'
            }
            if (id.includes('axios') || id.includes('jszip')) {
              return 'utils-vendor'
            }
            // Other node_modules go into vendor chunk
            return 'vendor'
          }
        },
      },
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})

