import { defineConfig } from 'vite'
import tailwindcss from "@tailwindcss/vite"

import react from '@vitejs/plugin-react'
import path from 'path';


// https://vite.dev/config/

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        session: path.resolve(__dirname, 'session.html'),
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
