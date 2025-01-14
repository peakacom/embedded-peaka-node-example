import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const HTTPS = process.env.HTTPS === "true";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    open: true,
    host: "localhost",
    port: 5173,
    ...(HTTPS
      ? {
          https: {
            key: "./key.pem",
            cert: "./cert.pem"
          }
        }
      : {})
  }
})
