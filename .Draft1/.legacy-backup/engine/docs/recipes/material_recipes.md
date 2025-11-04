# Material Recipes

## Triplanar Albedo Blend

Leverage `materials/triplanar.ts` to blend textures across arbitrary geometry without UV seams.

```ts
import { core, materials } from '@engine'

const renderer = await core.createRenderer()
const { material } = materials.createPBRStandard({
  baseColor: materials.triplanarSample(diffuseTexture, {
    scale: 1.5,
    sharpness: 6.0,
  }),
  normal: materials.triplanarNormal(normalTexture, {
    scale: 1.5,
    sharpness: 8.0,
  }),
  roughness: 0.32,
})
```

- Use higher `sharpness` for more axis-locked blending; reduce for softer transitions.
- Pair with `materials.utils.toFloatNode` for animating scale at runtime.

## Anisotropic Brushed Metal

`materials/anisotropy.ts` patches a metal surface with directionally aligned highlights.

```ts
const { material } = materials.createPBRStandard({
  baseColor: '#b9c3d8',
  metalness: 1,
  roughness: 0.18,
  anisotropy: {
    strength: 0.65,
    rotation: materials.utils.toVec3Node([1, 0, 0]),
  },
  clearcoat: { strength: 0.6, roughness: 0.08 },
})
```

- For spun metals swap `rotation` with a procedurally generated tangent vector.
- Layer a subtle normal map for striation detail when combined with `toVec3Node` jitter.

## SSR Prep Notes

The SSR module is planned for the next milestone. In the meantime:

- Capture metallic/glossy surfaces with `createPBRStandard` while reserving `material.iorNode` for future reflection fresnel control.
- When integrating SSR, feed the resolved TAA target via `fx.pipeline.buildFXPipeline(..., { post: { inputKey: taa.resolvedTargetKey } })` to avoid double tonemapping.
- Keep world-space normals accessible (e.g., via custom `material.normalNode`) to reuse once the SSR pass lands.

> 📸 **Screenshot placeholders**
>
> - `docs/media/triplanar-blend.png` — highland rock triplanar blend (exposure +0.2)
> - `docs/media/anisotropy-brushed.png` — brushed metal with 0.6 anisotropy
>
> Drop the captures into `public/docs/media/` and update this markdown when ready.



