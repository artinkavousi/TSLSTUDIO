import { MeshPhysicalNodeMaterial } from 'three/webgpu'
import {
  abs,
  color,
  dot,
  float,
  mix,
  normalize,
  screenUV,
  sin,
  time,
  vec3,
} from 'three/tsl'

import { createPBRStandard, type PBRMaterialHandle } from '../pbr/standard'; 

export interface HologramMaterialOptions {
  baseColor?: string
  glowColor?: string
  scanSpeed?: number
  distortion?: number
  fresnelStrength?: number
}

export function createHologramMaterial(options: HologramMaterialOptions = {}): PBRMaterialHandle {
  const scanSpeed = float(options.scanSpeed ?? 2.5)
  const distortion = float(options.distortion ?? 0.2)
  const fresnelStrength = float(options.fresnelStrength ?? 1.4)

  const handle = createPBRStandard({
    baseColor: options.baseColor ?? '#3fdfff',
    metalness: 0,
    roughness: 0.2,
    emissive: options.glowColor ?? '#3fdfff',
    emissiveStrength: 1.5,
    opacity: 0.8,
  })

  const material = handle.material as MeshPhysicalNodeMaterial

  const uv = screenUV
  const scan = sin(time.mul(scanSpeed).add(uv.y.mul(6))).mul(0.5).add(0.5)
  const distort = sin(uv.y.mul(40).add(time.mul(6))).mul(distortion)
  const bands = abs(sin(uv.y.mul(200).add(time.mul(12))))

  const base = handle.nodes.baseColor
  const glow = color(options.glowColor ?? '#9ff6ff')

  const normalNode = normalize((material.normalNode as any) ?? vec3(0, 0, 1))
  const viewDir = vec3(0, 0, 1)
  const fresnel = float(1).sub(abs(dot(normalNode, viewDir))).pow(3).mul(fresnelStrength)
  const hologram = mix(base, glow, scan.mul(0.6).add(bands.mul(0.4))).add(glow.mul(fresnel))

  material.colorNode = hologram.clamp(0, 2)
  material.metalnessNode = float(0)
  material.roughnessNode = float(0.05)
  material.opacityNode = float(0.6).add(distort).clamp(0.2, 1)

  return {
    ...handle,
    material,
  }
}

