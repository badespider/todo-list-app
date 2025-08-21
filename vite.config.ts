import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Set base for GitHub Pages project site; replace REPO_NAME below at runtime if needed
  base: "/todo-list-app/",
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
})
