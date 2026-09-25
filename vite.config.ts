import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import fs from 'node:fs';

export default defineConfig({
  base: './',
  plugins: [
    tailwindcss(),
    react(),
    {
      name: 'logo-uploader',
      configureServer(server) {
        server.middlewares.use('/api/upload-logo', (req, res) => {
          if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', () => {
              try {
                const { image } = JSON.parse(body);
                if (image && image.includes('base64,')) {
                  const base64Data = image.split(';base64,').pop();
                  const buffer = Buffer.from(base64Data, 'base64');
                  fs.writeFileSync('public/grand-logo.png', buffer);
                  fs.writeFileSync('src/assets/grand-logo.png', buffer);
                  try {
                    fs.writeFileSync('dist/grand-logo.png', buffer);
                  } catch (_) {}
                }
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: true }));
              } catch (e) {
                res.statusCode = 500;
                res.end(JSON.stringify({ error: String(e) }));
              }
            });
          } else {
            res.statusCode = 404;
            res.end();
          }
        });
      },
    },
  ],
  server: {
    port: 3000,
    host: true,
  },
});
