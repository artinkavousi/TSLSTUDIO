# TSL-KIT

Workspace scaffold for the new TSLStudio implementation described in the comprehensive development plan. The repository is structured as a monorepo powered by pnpm workspaces with separate packages for the core TSL node library, higher-level engine systems, and the React studio application.

## Structure

- `packages/tsl` – First wave of reusable TSL helpers. Currently includes the lighting utilities ported from the reference portfolio examples.
- `packages/tsl/utils/function` – Utility nodes for smoothing, remapping, compose transforms, and rotation helpers.
- `packages/tsl/utils/sdf` – Signed distance primitives, blending operations, and helper generators (raymarching, normals, AO, soft shadows).
- `packages/tsl/noise` – Newly ported simplex, classic perlin, and Voronoi nodes with supporting helpers.
- `DOCS/` – Planning documents that drive scope and sequencing. Start with the comprehensive plan and implementation roadmap when adding new modules.

## Getting Started

```bash
pnpm install
pnpm run build
pnpm test
```

## Next Steps

- Expand the `@tslstudio/tsl` package with the remaining utilities outlined for Phase 1 (noise, SDF, helpers).
- Introduce `packages/engine` and `packages/studio` workspaces, wiring them to consume the library code.
- Set up linting and formatting configs aligned with project standards.
- Document each new module following the templates in the comprehensive plan.

