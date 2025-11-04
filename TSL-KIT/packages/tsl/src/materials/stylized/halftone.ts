import { MeshPhysicalNodeMaterial } from 'three/webgpu'
import { color, cos, float, fract, mix, screenUV, sin, vec2 } from 'three/tsl'

import { createPBRStandard, type PBRMaterialHandle } from '../pbr/standard'; 

export interface HalftoneMaterialOptions {
  baseColor?: string
  dotColor?: string
  scale?: number
  angle?: number
  contrast?: number
}

export function createHalftoneMaterial(options: HalftoneMaterialOptions = {}): PBRMaterialHandle {
  const scale = float(options.scale ?? 120)
  const angle = float((options.angle ?? 45) * (Math.PI / 180))
  const contrast = float(options.contrast ?? 1.5)

  const handle = createPBRStandard({
    baseColor: options.baseColor ?? '#f6f2ea',
    metalness: 0,
    roughness: 0.9,
  })

  const material = handle.material as MeshPhysicalNodeMaterial

  const uv = screenUV.mul(scale)
  const rotated = vec2(
    uv.x.mul(cos(angle)).sub(uv.y.mul(sin(angle))),
    uv.x.mul(sin(angle)).add(uv.y.mul(cos(angle))),
  )

  const grid = fract(rotated).sub(0.5)
  const dist = grid.length()
  const pattern = float(1).sub(dist.mul(contrast).clamp(0, 1))

  const base = handle.nodes.baseColor
  const dots = color(options.dotColor ?? '#2b2b2b')

  material.colorNode = mix(base, dots, pattern)
  material.metalnessNode = float(0)
  material.roughnessNode = float(0.6)

  return {
    ...handle,
    material,
  }
}

