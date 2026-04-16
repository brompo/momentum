import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import fs from 'fs'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons.svg'],
      manifest: {
        name: 'Momentum Assistant',
        short_name: 'Momentum',
        description: 'Personal Daily Assistant & Goal Tracker',
        theme_color: '#060608',
        background_color: '#060608',
        display: 'standalone',
        icons: [
          {
            src: 'favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any'
          },
          {
            src: 'favicon.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
            purpose: 'any'
          },
          {
            src: 'favicon.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      },
      devOptions: {
        enabled: true,
        suppressWarnings: true
      }
    }),
    {
      name: 'save-feature-map',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url === '/api/save-feature-map' && req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', () => {
              try {
                const filePath = path.join(process.cwd(), 'src/data/featuremap.json');
                const data = JSON.parse(body);
                
                // Clean up IDs to keep the source JSON clean if preferred
                const cleanData = {
                  achieved: data.achieved.map(({ id, ...rest }) => rest),
                  pipeline: data.pipeline.map(({ id, ...rest }) => rest)
                };

                fs.writeFileSync(filePath, JSON.stringify(cleanData, null, 2) + '\n');
                
                res.statusCode = 200;
                res.setHeader('Content-Type', 'text/plain');
                res.end('File saved successfully');
              } catch (err) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'text/plain');
                res.end('Error saving file: ' + err.message);
              }
            });
          } else {
            next();
          }
        });
      }
    }
  ],
})
