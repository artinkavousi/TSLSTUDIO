import { MeshPhysicalNodeMaterial } from 'three/webgpu'
import { abs, color, float, mix, positionWorld, time } from 'three/tsl'

import { simplexNoise3d } from '../../noise/simplex_noise_3d'; 

import { createPBRStandard, type PBRMaterialHandle } from '../pbr/standard'; 

export interface DissolveMaterialOptions {
  baseColor?: string
  edgeColor?: string
  threshold?: number
  edgeWidth?: number
  noiseScale?: number
  noiseSpeed?: number
}

export function createDissolveMaterial(options: DissolveMaterialOptions = {}): PBRMaterialHandle {
  const threshold = float(options.threshold ?? 0.5)
  const edgeWidth = float(options.edgeWidth ?? 0.1)
  const noiseScale = float(options.noiseScale ?? 2.5)
  const noiseSpeed = float(options.noiseSpeed ?? 1.5)

  const handle = createPBRStandard({
    baseColor: options.baseColor ?? '#ff875f',
    metalness: 0,
    roughness: 0.35,
    opacity: 1,
  })

  const material = handle.material as MeshPhysicalNodeMaterial

  const animatedPos = positionWorld.mul(noiseScale).add(time.mul(noiseSpeed))
  const noise = simplexNoise3d(animatedPos).mul(0.5).add(0.5)

  const dissolveMask = noise.sub(threshold)
  const edge = abs(dissolveMask).lessThan(edgeWidth).select(float(1), float(0))
  const opacity = dissolveMask.greaterThan(0).select(float(1), float(0))

  const base = handle.nodes.baseColor
  const edgeColor = color(options.edgeColor ?? '#ffffff')

  material.colorNode = mix(base, edgeColor, edge).clamp(0, 1)
  material.opacityNode = opacity
  material.metalnessNode = float(0)
  material.roughnessNode = float(0.35)

  return {
    ...handle,
    material,
  }
}

