# TSL Textures Integration

## Overview

The `tsl-textures` library provides a catalog of procedural Three.js Shading Language (TSL) textures authored by Pavel Boytchev. Version `2.5.0` ships more than forty ready-to-use node graphs – ranging from organic surfaces like `brain`, `karstRock`, and `tigerFur` to effects such as `turbulentSmoke`, `caustics`, and `romanPaving`. Official documentation with live previews is available at [boytchev.github.io/tsl-textures](https://boytchev.github.io/tsl-textures/).

## What’s Included in TSL Studio

- `@tslstudio/tsl`
  - New `textures` module that re-exports every factory shipped by `tsl-textures@2.5.0`.
  - Utility re-exports (`hsl`, `noised`, `TSLFn`, etc.) exposed via `textures/utils`.
  - `TEXTURE_NAMES`, `textureRegistry`, and `textureCatalog` helpers for discovery and UI tooling.
  - TypeScript helpers (`TextureNodeFactory`, `TextureCatalogEntry`) describing texture factories and metadata.
- `@tslstudio/engine`
  - Mirrors the `textures` module so downstream packages can import everything from the engine facade.
- Tooling
  - A Vitest suite (`packages/tsl/src/textures/__tests__/textures.test.ts`) that validates registry coverage and metadata integrity.

## Installing Dependencies

```
pnpm install
```

This installs the new runtime dependency:

- `tsl-textures@^2.5.0`

> **Note:** If `pnpm` is unavailable in your environment, install it via `corepack enable` or use `npm install tsl-textures --workspace packages/tsl` as a temporary fallback.

## Using Textures in Node Materials

```ts
import { MeshStandardNodeMaterial } from 'three/webgpu'
import * as THREE from 'three/webgpu'
import { textures } from '@tslstudio/engine'

const material = new MeshStandardNodeMaterial({
  color: 0xffffff,
  roughness: 0.6
})

// Retrieve texture factory by name and assign to the color node.
const planet = textures.getTexture('planet')

material.colorNode = planet({
  scale: 2,
  iterations: 5,
  levelSea: 0.28,
  levelMountain: 0.72,
  colorDeep: new THREE.Color(0x0a2540),
  colorGrass: new THREE.Color(0x6ea04b)
})

// Optional: hook up additional channels when exposed.
if (planet.normal) {
  material.normalNode = planet.normal({})
}
```

Every factory preserves the `.defaults` metadata defined in the upstream package, enabling UIs to pre-populate control panels or drive documentation.

## Exploring the Catalog Programmatically

```ts
import { textureCatalog } from '@tslstudio/tsl/textures'

textureCatalog.forEach((entry) => {
  console.log(entry.name, entry.defaults.$name)

  if (entry.hasOpacity) {
    // expose opacity channel in material editors
  }
})
```

- `TEXTURE_NAMES`: tuple of canonical factory names in export order.
- `textureRegistry`: frozen record of name → factory mappings.
- `getTexture(name)`: convenience accessor.
- `textureCatalog`: array enriched with booleans that surface `normal`, `opacity`, and `roughness` support.

## Utility Re-Exports

The following helpers from `tsl-textures` are available via `@tslstudio/tsl/textures`:

- Color space: `hsl`, `toHsl`
- Noise and sampling: `noise`, `noised`, `vnoise`
- Matrix builders: `matRotX`, `matRotY`, `matRotZ`, `matRotYXZ`, `matScale`, `matTrans`
- Selection helpers: `selectPlanar`, `overlayPlanar`
- Miscellaneous: `dynamic`, `spherical`, `applyEuler`, `remapExp`, `normalVector`, `prepare`, `TSLFn`, `showFallbackWarning`, `hideFallbackWarning`

Refer to the upstream reference pages for parameter details (e.g. [planet](https://boytchev.github.io/tsl-textures/docs/planet.html?utm_source=tslstudio), [caustics](https://boytchev.github.io/tsl-textures/docs/caustics.html?utm_source=tslstudio)).

## Testing

- Run `npx vitest run packages/tsl/src/textures/__tests__/textures.test.ts` to validate the registry.
- The test ensures all named exports resolve and that catalog metadata stays in sync with the upstream defaults.

## Change Log Summary

- Added dependency: `tsl-textures@^2.5.0` (packages/tsl).
- Introduced `packages/tsl/src/textures` module with registry helpers and typings.
- Re-exported textures through `@tslstudio/engine` for downstream use.
- Documented integration steps and sample usage in this guide.

