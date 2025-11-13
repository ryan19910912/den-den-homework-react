import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // 確保您的前端運行在 5173 端口
    proxy: {
      // 匹配所有以 /api 開頭的請求
      // 注意：由於您的 API 路徑是 /auth/xxx 或 /member/xxx，我們直接代理 /
      '/auth': {
        // 你的後端服務地址
        target: 'https://den-den-homework-224745575295.europe-west1.run.app',
        // 允許代理 HTTPS 證書無效的目標
        secure: false,
        // 更改請求頭的 host 字段，通常推薦開啟
        changeOrigin: true,
      },
      '/member': {
        target: 'https://den-den-homework-224745575295.europe-west1.run.app',
        secure: false,
        changeOrigin: true,
      },
    },
  },
})
