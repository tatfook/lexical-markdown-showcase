import {fileURLToPath, URL} from "url";
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import raw from 'vite-raw-plugin'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), raw({
    fileRegex: /\.md$/i,
  })],
  resolve: {
    alias: [
      {find: '@', replacement: fileURLToPath(new URL('./src', import.meta.url))},
    ],
  },
})
