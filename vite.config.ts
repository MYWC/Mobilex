import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@': path.resolve(process.cwd(), './src') } },
  server: { host: true, port: 5173, strictPort: true },
  preview: { host: true, port: 4173, strictPort: true },
  build: {
    target: 'es2022',
    cssCodeSplit: true,
    sourcemap: process.env.VITE_BUILD_SOURCEMAP === 'true',
    reportCompressedSize: false,
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor_react: ['react', 'react-dom', 'react-router-dom'],
          vendor_state: ['zustand'],
          vendor_ui: ['lucide-react'],
          vendor_data: ['@supabase/supabase-js', 'zod'],
        },
        assetFileNames: assetInfo => assetInfo.name?.endsWith('.css') ? 'assets/css/[name]-[hash][extname]' : 'assets/[name]-[hash][extname]',
      },
    },
  },
});
