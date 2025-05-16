import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000, // Changed to 3000
    // proxy: { // Optional: configure if you want to proxy API requests from Vite dev server to your backend
    //   '/api': {
    //     target: 'http://localhost:3000', // Your backend server, updated to 3000
    //     changeOrigin: true,
    //   }
    // }
  }
}); 