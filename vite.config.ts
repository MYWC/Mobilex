import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';

export default defineConfig(() => ({
  base: '/Mobilex/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(process.cwd(), './src') },
  },
  server: { host: true, port: 5173, strictPort: true },
  preview: { host: true, port: 4173, strictPort: true },
  build: {
    target: 'es2022',
    cssCodeSplit: true,
    sourcemap: process.env.VITE_BUILD_SOURCEMAP === 'true',
    reportCompressedSize: false,
    chunkSizeWarningLimit: 700,
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: 'react-vendor', test: /node_modules[\\/]react(?:-dom)?(?:[\\/]|$)/, priority: 30 },
            {
              name: 'router-vendor',
              test: /node_modules[\\/]react-router(?:-dom)?(?:[\\/]|$)/,
              priority: 25,
            },
            { name: 'state-vendor', test: /node_modules[\\/]zustand(?:[\\/]|$)/, priority: 20 },
            { name: 'ui-vendor', test: /node_modules[\\/]lucide-react(?:[\\/]|$)/, priority: 15 },
            { name: 'data-vendor', test: /node_modules[\\/](?:@supabase|zod)(?:[\\/]|$)/, priority: 15 },
            { name: 'vendor', test: /node_modules[\\/]/, priority: 5 },
          ],
        },
        assetFileNames: (assetInfo) =>
          assetInfo.name?.endsWith('.css')
            ? 'assets/css/[name]-[hash][extname]'
            : 'assets/[name]-[hash][extname]',
      },
    },
  },
}));
