import { MeshPhysicalNodeMaterial } from 'three/webgpu'
import { color, mix, smoothstep, time, uv, vec3 } from 'three/tsl'

import { grainTextureEffect } from '../../post/effects/grain_texture_effect'; 

/**
 * Creates a stylised iridescent car paint material with animated flakes.
 */
export function carPaintIridescent(): MeshPhysicalNodeMaterial {
  const uvNode = uv()

  const flake = smoothstep(0.4, 0.95, grainTextureEffect(uvNode.mul(200))).mul(0.25)

  const baseA = color('#1b1f73')
  const baseB = color('#7f5afd')
  const hueShift = smoothstep(0.0, 1.0, time.mul(0.1).fract())
  const base = mix(baseA, baseB, hueShift)

  const coat = base.add(flake)

  return new MeshPhysicalNodeMaterial({
    colorNode: coat,
    roughnessNode: mix(0.08, 0.18, flake),
    clearcoatNode: vec3(0.85),
    clearcoatRoughnessNode: 0.05,
    anisotropyNode: 0.65,
    anisotropyRotationNode: vec3(1, 0, 0),
    iridescenceNode: 1.0,
    iridescenceIORNode: 1.6,
    iridescenceThicknessRange: vec3(250, 900, 1),
  })
}

