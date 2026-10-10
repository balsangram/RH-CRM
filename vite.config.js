import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'fix-jsx-mime-type',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const originalSetHeader = res.setHeader;
          res.setHeader = function (name, value) {
            if (typeof name === 'string' && name.toLowerCase() === 'content-type') {
              if (typeof value === 'string' && (value.includes('application/octet-stream') || value.includes('text/plain'))) {
                const url = (req.url || '').toLowerCase();
                const isMediaOrDoc = url.endsWith('.css') || url.endsWith('.html') || url.endsWith('.png') ||
                                     url.endsWith('.jpg') || url.endsWith('.jpeg') || url.endsWith('.gif') ||
                                     url.endsWith('.svg') || url.endsWith('.ico') || url.endsWith('.json') ||
                                     url.endsWith('.woff') || url.endsWith('.woff2');
                if (!isMediaOrDoc) {
                  value = 'application/javascript; charset=utf-8';
                }
              }
            }
            return originalSetHeader.call(this, name, value);
          };
          next();
        });
      }
    }
  ],
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
          if (id.includes('SuperAdminDashboard')) {
            return 'superadmin-dashboard';
          }
          if (id.includes('StaffDashboard')) {
            return 'staff-dashboard';
          }
          if (id.includes('UserDashboard')) {
            return 'user-dashboard';
          }
        }
      }
    }
  }
})



