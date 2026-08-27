import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// 站点部署在域名根路径下（如 https://toolhub.example.com/）
export default defineConfig({
  plugins: [react()],
})
