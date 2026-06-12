import { copyFileSync } from 'node:fs';
import { join } from 'node:path';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

const base = process.env.BASE_PATH || '/';

function copy404Plugin(): Plugin {
  return {
    name: 'copy-404-for-github-pages',
    closeBundle() {
      const dist = join(__dirname, 'dist');
      copyFileSync(join(dist, 'index.html'), join(dist, '404.html'));
    },
  };
}

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true,
      },
      includeAssets: ['logo.png', 'mixing-tank.png', 'favicon-32.png'],
      manifest: {
        id: base,
        name: 'JP Sons Engineering',
        short_name: 'JP Sons',
        description: 'Mixing tank calculator by JP Sons Engineering',
        theme_color: '#2e5da7',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: base,
        start_url: base,
        categories: ['business', 'productivity'],
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'pwa-maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,webmanifest}'],
        navigateFallback: 'index.html',
        navigateFallbackDenylist: [/^\/api/],
      },
    }),
    copy404Plugin(),
  ],
});
