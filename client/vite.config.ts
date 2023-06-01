import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    https: {
      cert: "../server/certs/server.crt",
      key: "../server/certs/server.key",
    },
    proxy: {
      "*": "https://localhost:4316"
    }
  }
})