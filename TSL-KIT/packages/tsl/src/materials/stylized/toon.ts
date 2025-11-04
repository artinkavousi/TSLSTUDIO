import { MeshPhysicalNodeMaterial } from 'three/webgpu'
import { color, dot, float, normalize, pow, vec3 } from 'three/tsl'

import { createPBRStandard, type PBRMaterialHandle } from '../pbr/standard'; 

export interface ToonMaterialOptions {
  baseColor?: string
  steps?: number
  rimStrength?: number
  rimColor?: string
  lightDirection?: [number, number, number]
}

export function createToonMaterial(options: ToonMaterialOptions = {}): PBRMaterialHandle {
  const steps = Math.max(1, Math.floor(options.steps ?? 4))
  const [lx, ly, lz] = options.lightDirection ?? [0.4, 0.75, 0.5]
  const lightDir = normalize(vec3(lx, ly, lz))
  const rimStrength = float(options.rimStrength ?? 0.35)
  const rimColor = color(options.rimColor ?? '#ffffff')

  const handle = createPBRStandard({
    baseColor: options.baseColor ?? '#4e6ef2',
    metalness: 0,
    roughness: 0.85,
  })

  const material = handle.material as MeshPhysicalNodeMaterial

  const normalNode = normalize((material.normalNode as any) ?? vec3(0, 0, 1))
  const ndl = dot(normalNode, lightDir).clamp(0, 1)
  const quantized = ndl.mul(float(steps)).floor().div(float(Math.max(steps - 1, 1))).clamp(0, 1)
  const base = handle.nodes.baseColor.mul(quantized)

  const rim = pow(float(1).sub(ndl), 4).mul(rimStrength)
  const toonColor = base.add(rimColor.mul(rim)).clamp(0, 1)

  material.colorNode = toonColor
  material.metalnessNode = float(0)
  material.roughnessNode = float(0.2)

  return {
    ...handle,
    material,
  }
}

