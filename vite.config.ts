import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'  // 修正导入方式

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  define: {
    // 添加process的定义，解决"Can't find variable: process"错误
    'process': {
      env: {
        NODE_ENV: JSON.stringify('development')
      },
      // 正确模拟 process.cwd 函数，返回字符串而不是JSON字符串
      cwd: () => '"/"'
    }
  }
})
