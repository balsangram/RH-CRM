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
                if (req.url && (req.url.includes('.jsx') || req.url.includes('.js') || req.url.includes('.tsx') || req.url.includes('.ts'))) {
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
  ]
})


