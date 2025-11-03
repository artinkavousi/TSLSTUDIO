import fs from 'node:fs';
import path from 'node:path';
import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';

const workspaceRoot = path.resolve(__dirname, '../..');
const pnpmModules = path.resolve(workspaceRoot, 'node_modules/.pnpm');
const threeEntries = fs.readdirSync(pnpmModules).filter((dir) => dir.startsWith('three@'));

if (threeEntries.length === 0) {
  throw new Error('Unable to locate three.js package within pnpm modules');
}

const threeEntry = threeEntries.sort().at(-1)!;

const threeDir = path.resolve(pnpmModules, threeEntry, 'node_modules/three');

const extensionUtilRegex = /three-mesh-bvh[\\/].*ExtensionUtilities\.js($|\?)/
const shimPath = path.resolve(__dirname, 'src/shims/three-with-batchedmesh.js')

const patchThreeMeshBvh = (): Plugin => ({
  name: 'patch-three-mesh-bvh-batchedmesh',
  enforce: 'pre',
  resolveId(source, importer) {
    if (source === 'three' && importer) {
      const normalizedImporter = importer.replace(/\\/g, '/')
      if (extensionUtilRegex.test(normalizedImporter)) {
        return shimPath
      }
    }
    return null
  }
});

export default defineConfig({
  plugins: [patchThreeMeshBvh(), react()],
  resolve: {
    alias: [
      { find: '@aurora/tsl-kit', replacement: path.resolve(workspaceRoot, 'packages/tsl-kit/src') },
      { find: 'three/webgpu', replacement: path.resolve(threeDir, 'build/three.webgpu.js') },
      { find: 'three/tsl', replacement: path.resolve(threeDir, 'build/three.tsl.js') },
      { find: '@three/batchedmesh', replacement: path.resolve(threeDir, 'src/objects/BatchedMesh.js') }
    ],
    dedupe: ['three', '@react-three/fiber', '@react-three/drei']
  },
  optimizeDeps: {
    include: ['three', 'three/webgpu', 'three/tsl'],
    exclude: ['three-mesh-bvh'],
    force: true // Force re-optimization
  }
});

