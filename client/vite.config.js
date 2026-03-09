import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    global: 'window', // Final push to ensure global is defined
  },
  resolve: {
    alias: {
      events: 'events',
      util: 'util',
      stream: 'readable-stream',
    },
  },
})