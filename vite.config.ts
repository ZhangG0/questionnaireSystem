import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  base: '/',
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    // proxy: {
    //   '/': {
    //     target: 'http://35.79.221.247',
    //     changeOrigin: true,
    //     rewrite: (path) => path.replace(/^\//, '')
    //   }
    // },
    port: 3000,
    open: true,
    cors: true
  }
}) 
