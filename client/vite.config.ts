// File: client/vite.config.ts

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  base: '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, '../shared'), // Adjusted path for shared
    },
  },
  // --- THIS IS THE FIX ---
  build: {
    outDir: 'dist', // Simply output to a 'dist' folder inside 'client'
  },
  server: {
    // proxy removed
  },
});
