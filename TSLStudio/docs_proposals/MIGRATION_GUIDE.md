# 🔄 TSLStudio Migration Guide

> Step-by-step guide to migrate from the old structure to the new unified architecture

## 📋 Table of Contents
1. [Overview](#overview)
2. [Pre-Migration Checklist](#pre-migration-checklist)
3. [Detailed Migration Steps](#detailed-migration-steps)
4. [Import Path Updates](#import-path-updates)
5. [Testing Strategy](#testing-strategy)
6. [Rollback Plan](#rollback-plan)

---

## Overview

This guide walks through migrating TSLStudio from the current dual-folder structure to the new unified `packages/` architecture.

### Current Structure
```
TSLStudio/
├── engine/         ← Low-level rendering (duplicate features)
├── src/            ← App + TSL utilities (duplicate features)
└── ...
```

### Target Structure
```
TSLStudio/
├── packages/
│   ├── engine/     ← Pure rendering engine
│   ├── tsl/        ← Unified TSL library (merged)
│   └── studio/     ← App layer
└── ...
```

---

## Pre-Migration Checklist

### ✅ Preparation

- [ ] **Backup Everything**
  ```bash
  git checkout -b migration/unified-architecture
  git commit -am "Pre-migration checkpoint"
  ```

- [ ] **Document Current State**
  - List all files in `/engine`
  - List all files in `/src/tsl`
  - Identify duplicates
  - Map import dependencies

- [ ] **Test Current State**
  ```bash
  pnpm test      # Run all tests
  pnpm build     # Ensure clean build
  pnpm dev       # Verify dev server works
  ```

- [ ] **Install Tools**
  - VSCode extension: "Move TS" for refactoring
  - `fd` or `ripgrep` for searching imports

---

## Detailed Migration Steps

### Phase 1: Create New Structure (Day 1)

#### Step 1.1: Create Package Directories
```bash
# Create the new directory structure
mkdir -p packages/engine
mkdir -p packages/tsl
mkdir -p packages/studio
```

#### Step 1.2: Move Engine Core
```bash
# Move pure engine code (no duplicates)
mv engine/core packages/engine/core
mv engine/docs packages/engine/docs

# Update engine index
cat > packages/engine/index.ts << 'EOF'
export * from './core'
export * as core from './core'
EOF
```

#### Step 1.3: Set Up TSL Package Structure
```bash
# Create TSL subdirectories
mkdir -p packages/tsl/materials
mkdir -p packages/tsl/compute
mkdir -p packages/tsl/post
mkdir -p packages/tsl/noise
mkdir -p packages/tsl/utils
```

---

### Phase 2: Merge Duplicates (Day 2-3)

#### Step 2.1: Merge Materials

**Analysis:**
- `/engine/materials/` has: anisotropy, clearcoat, matcap, pbrStandard, sheen, transmission, triplanar, utils
- `/src/tsl/materials/` has: car_paint_iridescent

**Action:**
```bash
# Move engine materials to TSL (they're more complete)
mv engine/materials packages/tsl/materials/pbr

# Move src materials
mv src/tsl/materials/pbr packages/tsl/materials/pbr/

# Merge and organize
cd packages/tsl/materials
mkdir -p pbr stylized

# Rename files to kebab-case
mv pbr/pbrStandard.ts pbr/standard.ts
mv pbr/carPaintIridescent.ts pbr/iridescent.ts
```

**Create unified index:**
```typescript
// packages/tsl/materials/index.ts
export * from './pbr'
export * from './stylized'

export * as pbr from './pbr'
export * as stylized from './stylized'
```

#### Step 2.2: Merge Compute

**Analysis:**
- `/engine/compute/` has: curlNoise, fluid2d, particles, sdf
- `/src/tsl/compute/` has: particles

**Action:**
```bash
# Compare implementations
diff engine/compute/particles.ts src/tsl/compute/particles.ts

# Choose best implementation (likely engine has more features)
mv engine/compute packages/tsl/compute

# Organize into subdirectories
cd packages/tsl/compute
mkdir -p particles simulation

mv particles.ts particles/emitter.ts
mv fluid2d.ts simulation/
mv curlNoise.ts simulation/curl-noise.ts
mv sdf.ts simulation/
```

#### Step 2.3: Merge Post-Processing

**Analysis:**
- `/engine/fx/` has: bloom, taa, dof, chromaticAberration, colorgrading, filmgrain, vignette, pipeline, postPass, chain
- `/src/tsl/post_processing/` has: composer, grain_texture_effect, lcd_effect, pixellation_effect, canvas_weave_effect, speckled_noise_effect, vignette_effect, bloom, tonemap

**Action:**
```bash
# Engine fx is more complete, start with that
mv engine/fx packages/tsl/post

# Rename to match convention
cd packages/tsl
mv fx post

# Merge unique effects from src/tsl
cp src/tsl/post_processing/lcd_effect.ts packages/tsl/post/effects/
cp src/tsl/post_processing/pixellation_effect.ts packages/tsl/post/effects/
cp src/tsl/post_processing/canvas_weave_effect.ts packages/tsl/post/effects/
cp src/tsl/post_processing/speckled_noise_effect.ts packages/tsl/post/effects/

# Organize structure
cd packages/tsl/post
mkdir -p core effects

mv pipeline.ts core/
mv postPass.ts core/pass.ts
mv chain.ts core/

mv bloom.ts effects/
mv dof.ts effects/
# ... move all effects
```

#### Step 2.4: Move Noise (No Conflicts)
```bash
# Noise only exists in src/tsl
mv src/tsl/noise packages/tsl/noise

# Rename files to kebab-case
cd packages/tsl/noise
mv simplex_noise_3d.ts simplex-3d.ts
mv simplex_noise_4d.ts simplex-4d.ts
mv curl_noise_3d.ts curl-3d.ts
mv curl_noise_4d.ts curl-4d.ts
mv perlin_noise_3d.ts perlin-3d.ts
```

#### Step 2.5: Move TSL Utils (No Conflicts)
```bash
mv src/tsl/utils packages/tsl/utils

# Rename files
cd packages/tsl/utils/function
mv screen_aspect_uv.ts screen-aspect-uv.ts
mv bloom_edge_pattern.ts bloom-edge-pattern.ts
mv domain_index.ts domain-index.ts
mv repeating_pattern.ts repeating-pattern.ts
```

---

### Phase 3: Move Studio Layer (Day 4)

#### Step 3.1: Move Components
```bash
mv src/components packages/studio/components

# Rename files to PascalCase
cd packages/studio/components/canvas
mv webgpu_scene.tsx WebGPUScene.tsx
mv webgpu_sketch.tsx WebGPUSketch.tsx
mv color_space_correction.tsx ColorSpaceCorrection.tsx
```

#### Step 3.2: Move Routes, Sketches, Utils
```bash
mv src/routes packages/studio/routes
mv src/sketches packages/studio/sketches
mv src/utils packages/studio/utils
mv src/main.tsx packages/studio/main.tsx
mv src/index.css packages/studio/index.css
```

#### Step 3.3: Create Studio Index
```typescript
// packages/studio/index.ts
export * from './components'
export * from './utils'
```

---

### Phase 4: Update Configurations (Day 5)

#### Step 4.1: Create Base TypeScript Config
```json
// config/tsconfig.base.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "strict": true,
    "skipLibCheck": true
  }
}
```

#### Step 4.2: Create Package Configs
```json
// packages/engine/tsconfig.json
{
  "extends": "../../config/tsconfig.base.json",
  "compilerOptions": {
    "rootDir": ".",
    "composite": true
  },
  "include": ["**/*.ts"],
  "exclude": ["node_modules"]
}
```

```json
// packages/tsl/tsconfig.json
{
  "extends": "../../config/tsconfig.base.json",
  "compilerOptions": {
    "rootDir": ".",
    "composite": true
  },
  "references": [
    { "path": "../engine" }
  ],
  "include": ["**/*.ts"],
  "exclude": ["node_modules"]
}
```

```json
// packages/studio/tsconfig.json
{
  "extends": "../../config/tsconfig.base.json",
  "compilerOptions": {
    "rootDir": ".",
    "jsx": "react-jsx",
    "composite": true
  },
  "references": [
    { "path": "../engine" },
    { "path": "../tsl" }
  ],
  "include": ["**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

#### Step 4.3: Update Root tsconfig.json
```json
{
  "extends": "./config/tsconfig.base.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@engine": ["./packages/engine/index.ts"],
      "@engine/*": ["./packages/engine/*"],
      "@tsl": ["./packages/tsl/index.ts"],
      "@tsl/*": ["./packages/tsl/*"],
      "@studio": ["./packages/studio/index.ts"],
      "@studio/*": ["./packages/studio/*"],
      "react": ["./node_modules/@types/react"]
    },
    "jsx": "react-jsx"
  },
  "references": [
    { "path": "./packages/engine" },
    { "path": "./packages/tsl" },
    { "path": "./packages/studio" }
  ],
  "include": ["packages/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

#### Step 4.4: Update Vite Config
```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import glsl from 'vite-plugin-glsl'
import path from 'path'
import { TanStackRouterVite } from '@tanstack/router-vite-plugin'

export default defineConfig({
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
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    target: 'esnext',
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'esnext',
    },
  },
})
```

#### Step 4.5: Update index.html
```html
<!-- index.html -->
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>TSLStudio</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/packages/studio/main.tsx"></script>
  </body>
</html>
```

---

### Phase 5: Update All Imports (Day 6-7)

This is the most critical phase. Every import must be updated.

#### Step 5.1: Update Engine Imports

**Before:**
```typescript
import { core, scenes } from '@engine'
import type { DemoSceneHandle } from '@engine/scenes'
```

**After:**
```typescript
import { createRenderer } from '@engine/core'
// No scenes in new engine - moved to studio/demos
```

#### Step 5.2: Update TSL Imports

**Before:**
```typescript
import { simplex_noise_3d } from '@/tsl/noise/simplex_noise_3d'
import { bloom } from '@/tsl/post_processing/bloom'
import { particles } from '@/tsl/compute/particles'
```

**After:**
```typescript
import { simplexNoise3d } from '@tsl/noise/simplex-3d'
import { bloom } from '@tsl/post/effects/bloom'
import { particles } from '@tsl/compute/particles'
```

#### Step 5.3: Update Studio Imports

**Before:**
```typescript
import WebGPUScene from '@/components/canvas/webgpu_scene'
import { Debug } from '@/components/debug'
```

**After:**
```typescript
import { WebGPUScene } from '@studio/components/canvas/WebGPUScene'
import { Debug } from '@studio/components/debug'
```

#### Step 5.4: Automated Search & Replace

Use this script to find all imports:

```bash
# Find all imports from @engine
rg "from ['\"]@engine" --type ts --type tsx

# Find all imports from @/tsl
rg "from ['\"]@/tsl" --type ts --type tsx

# Find all imports from @/components
rg "from ['\"]@/components" --type ts --type tsx
```

Create a replacement script:

```bash
#!/bin/bash
# migrate-imports.sh

# TSL imports
find packages/studio -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i 's/@\/tsl/@tsl/g' {} \;

# Component imports  
find packages/studio -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i 's/@\/components/@studio\/components/g' {} \;

# Utils imports
find packages/studio -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i 's/@\/utils/@studio\/utils/g' {} \;

# Sketches imports
find packages/studio -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i 's/@\/sketches/@studio\/sketches/g' {} \;
```

---

### Phase 6: Update Package Exports (Day 8)

#### Step 6.1: Engine Package Index
```typescript
// packages/engine/index.ts
export * from './core/renderer'
export * from './core/framegraph'
export * from './core/pipeline'
export * from './core/inspector'
export * from './core/assets'

export * as core from './core'
```

#### Step 6.2: TSL Package Index
```typescript
// packages/tsl/index.ts
export * from './materials'
export * from './compute'
export * from './post'
export * from './noise'
export * from './utils'

export * as materials from './materials'
export * as compute from './compute'
export * as post from './post'
export * as noise from './noise'
export * as utils from './utils'
```

#### Step 6.3: Studio Package Index
```typescript
// packages/studio/index.ts
export * from './components'
export * from './utils'

export * as components from './components'
export * as utils from './utils'
```

---

### Phase 7: Move Scenes to Studio (Day 9)

Scenes are app-level demos, not engine core.

```bash
# Move scenes from engine to studio
mv engine/scenes packages/studio/demos

# Rename files
cd packages/studio/demos
mv demoPBR.ts pbr-showcase/scene.ts
mv demoParticles.ts particles/scene.ts
```

Update scene imports:
```typescript
// packages/studio/demos/pbr-showcase/scene.ts
import { createRenderer } from '@engine/core'
import { pbrMaterial } from '@tsl/materials/pbr'
// ...
```

---

### Phase 8: Testing (Day 10-11)

#### Step 8.1: Type Check
```bash
# Check each package
cd packages/engine && tsc --noEmit
cd packages/tsl && tsc --noEmit
cd packages/studio && tsc --noEmit

# Check root
tsc --noEmit
```

#### Step 8.2: Build Test
```bash
pnpm build
```

#### Step 8.3: Dev Server Test
```bash
pnpm dev
# Open browser and test:
# - Homepage loads
# - All routes work
# - Sketches load
# - Demos work
# - No console errors
```

#### Step 8.4: Manual Testing Checklist
- [ ] Home page renders
- [ ] Sketches dropdown works
- [ ] Navigate to /sketches/flare-1
- [ ] Navigate to /sketches/nested/dawn-1
- [ ] Navigate to /demos/pbr
- [ ] Navigate to /demos/particles
- [ ] Check browser console (no errors)
- [ ] Check network tab (all assets load)
- [ ] Test hot reload in dev mode

---

### Phase 9: Cleanup (Day 12)

#### Step 9.1: Remove Old Directories
```bash
# After verifying everything works
rm -rf engine/
rm -rf src/
```

#### Step 9.2: Update .gitignore
```gitignore
# Build outputs
dist/
*.tsbuildinfo

# Dependencies
node_modules/

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db
```

#### Step 9.3: Update Package Scripts
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint packages --ext ts,tsx",
    "format": "prettier --write \"packages/**/*.{ts,tsx}\"",
    "typecheck": "tsc -b",
    "clean": "rimraf dist packages/**/dist packages/**/*.tsbuildinfo"
  }
}
```

---

## Import Path Updates

### Quick Reference

| Old Path | New Path |
|----------|----------|
| `@engine` | `@engine` (unchanged) |
| `@engine/scenes` | `@studio/demos` |
| `@/tsl/*` | `@tsl/*` |
| `@/components/*` | `@studio/components/*` |
| `@/utils/*` | `@studio/utils/*` |
| `@/sketches/*` | `@studio/sketches/*` |
| `@/routes/*` | `@studio/routes/*` |

---

## Testing Strategy

### Unit Tests
```typescript
// packages/tsl/__tests__/noise.test.ts
import { simplexNoise3d } from '@tsl/noise'
// Test that noise functions work correctly
```

### Integration Tests
```typescript
// packages/studio/__tests__/sketch-loading.test.tsx
import { loadSketch } from '@studio/utils'
// Test that sketches load correctly
```

### E2E Tests
```typescript
// e2e/navigation.spec.ts
test('can navigate to all routes', async () => {
  // Test full app navigation
})
```

---

## Rollback Plan

If something goes wrong:

1. **Stop immediately** if critical errors occur
2. **Revert to pre-migration branch:**
   ```bash
   git reset --hard HEAD~1
   git checkout main
   ```
3. **Document what went wrong**
4. **Create new strategy**
5. **Try again with fixes**

---

## Common Issues & Solutions

### Issue: "Cannot find module '@tsl/noise'"

**Solution:** Check `tsconfig.json` paths and `vite.config.ts` aliases match.

### Issue: "Circular dependency detected"

**Solution:** Ensure Engine doesn't import from TSL, and TSL doesn't import from Studio.

### Issue: "Type errors after migration"

**Solution:** Run `pnpm install` to regenerate lock file, then `tsc -b` to rebuild.

### Issue: "Sketches not loading"

**Solution:** Check TanStackRouterVite plugin config points to correct routes directory.

---

## Success Criteria

✅ **Migration is complete when:**
- All type checks pass (`tsc -b`)
- Build succeeds (`pnpm build`)
- Dev server runs (`pnpm dev`)
- All routes work
- No console errors
- All sketches render
- All demos function
- Imports follow new convention

---

## Post-Migration Tasks

1. **Update Documentation**
   - [ ] Update README.md
   - [ ] Update contributing guide
   - [ ] Update API docs

2. **Team Communication**
   - [ ] Announce migration completion
   - [ ] Share new import patterns
   - [ ] Schedule knowledge sharing session

3. **Monitoring**
   - [ ] Watch for issues in first week
   - [ ] Collect developer feedback
   - [ ] Document lessons learned

---

**Estimated Total Time:** 10-12 days  
**Risk Level:** Medium  
**Recommended Approach:** Incremental migration with frequent commits

---

*Last Updated: November 4, 2025*

