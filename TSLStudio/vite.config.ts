import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import glsl from 'vite-plugin-glsl'
import path from 'path'

import { TanStackRouterVite } from '@tanstack/router-vite-plugin'

// https://vitejs.dev/config/
export default defineConfig({
  optimizeDeps: {
    esbuildOptions: {
      target: 'esnext',
    },
  },
  build: {
    target: 'esnext',
  },
  plugins: [
    react(),
    glsl(),
    TanStackRouterVite({
      routesDirectory: './packages/studio/routes',
      generatedRouteTree: './packages/studio/routeTree.gen.ts',
    }),
  ],
  resolve: {
    alias: {
      '@engine': path.resolve(__dirname, 'packages/engine'),
      '@tsl': path.resolve(__dirname, 'packages/tsl'),
      '@studio': path.resolve(__dirname, 'packages/studio'),
    },
  },
})
