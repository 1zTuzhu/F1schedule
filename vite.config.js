import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: '/',        // 重要：Vercel 自域名部署用根路径
  build: {
    outDir: 'dist',
    sourcemap: false
  }
})
