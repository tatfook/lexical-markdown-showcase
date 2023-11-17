import {fileURLToPath, URL} from "url";
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import raw from 'vite-raw-plugin'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), raw({
    fileRegex: /\.md$/i,
  })],
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'LexicalMarkdownVue',
      fileName: (format) => `lexical-markdown-vue.${format}.js`
    },
    rollupOptions: {
      external: [
        'vue',
        'lexical-vue',
        '@vue/composition-api',
        '@lexical/clipboard',
        '@lexical/code',
        '@lexical/dragon',
        '@lexical/hashtag',
        '@lexical/history',
        '@lexical/link',
        '@lexical/list',
        '@lexical/mark',
        '@lexical/markdown',
        '@lexical/overflow',
        '@lexical/plain',
        '@lexical/rich',
        '@lexical/selection',
        '@lexical/table',
        '@lexical/text',
        '@lexical/utils',
        '@lexical/yjs',
        '@lexical/rich-text',
        'lexical'
      ],
      output: {
        globals: {
          vue: 'Vue'
        }
      }
    }
  },
  resolve: {
    alias: [
      {find: '@', replacement: fileURLToPath(new URL('./src', import.meta.url))},
    ],
  },
})
