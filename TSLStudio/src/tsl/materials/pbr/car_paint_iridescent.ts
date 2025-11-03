import { MeshPhysicalNodeMaterial } from 'three/webgpu'
import { color, mix, smoothstep, time, uv, vec3 } from 'three/tsl'
import { grainTextureEffect } from '@/tsl/post_processing/grain_texture_effect'

/**
 * Car paint style physical material using TSL nodes.
 * Layered look with subtle flakes, clearcoat, anisotropy and iridescence.
 */
export function carPaintIridescent(): MeshPhysicalNodeMaterial {
  const u = uv()

  // Flake-like modulation using a high-frequency noise surrogate
  const flake = smoothstep(0.4, 0.95, grainTextureEffect(u.mul(200))).mul(0.25)

  // Base color with hue shift driven by slow time variation
  const baseA = color('#1b1f73')
  const baseB = color('#7f5afd')
  const hueShift = smoothstep(0.0, 1.0, time().mul(0.1).fract())
  const base = mix(baseA, baseB, hueShift)

  // Coat mixes base with flakes
  const coat = base.add(flake)

  const m = new MeshPhysicalNodeMaterial({
    colorNode: coat,
    roughnessNode: mix(0.08, 0.18, flake),
    clearcoatNode: vec3(0.85),
    clearcoatRoughnessNode: 0.05,
    anisotropyNode: 0.65,
    anisotropyRotationNode: vec3(1, 0, 0),
    iridescenceNode: 1.0, // enable iridescence; thickness drives range
    iridescenceIORNode: 1.6,
    iridescenceThicknessRange: vec3(250, 900, 1),
  })

  return m
}


