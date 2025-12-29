import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import Components from 'unplugin-vue-components/vite';
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers';
import prismjs from 'vite-plugin-prismjs';

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  // 加载.env文件中的环境变量
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      vue(),
      vueDevTools(),
      Components({
        resolvers: [
          AntDesignVueResolver({
            importStyle: false, // css in js
          }),
        ],
      }),
      prismjs({
        languages: ['python', 'java', 'c', 'cpp', 'go', 'javascript', "json", "bash"],
      }),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            // 将大型库分离到单独的chunk中
            'monaco-editor': ['monaco-editor'],
            'echarts': ['echarts', 'vue-echarts'],
            'ant-design': ['ant-design-vue'],
            'prismjs': ['vite-plugin-prismjs'],
            // 将公共代码分离
            vendor: ['vue', 'vue-router', 'pinia', 'axios']
          }
        }
      },
    },
    server: {
      host: '0.0.0.0',
      proxy: {
        '/api': {
          target: env.VITE_BACKEND_URL,
          secure: false,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
        "/ai-service": {
          target: env.VITE_AI_SERVICE_BACKEND_URL,
          secure: false,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/ai-service/, ''),
        }
      },
    },
  };
});