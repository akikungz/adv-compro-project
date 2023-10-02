import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 8080,
  },
  define: {
    'process.env': process.env,
  },
  preview: {
    host: true,
    port: 8080
  }
})
