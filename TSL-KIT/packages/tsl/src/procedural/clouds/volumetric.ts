import { Fn, float, sin, vec3, time } from 'three/tsl'

import type { FloatNode, Vec3Node } from '../../index'; 

export interface CloudOptions {
  radius?: number
  noiseScale?: number
  speed?: number
  density?: number
}

export const cloudDensity = Fn<readonly [Vec3Node, FloatNode, FloatNode, FloatNode]>(
  ([position, radius, noiseScale, density]) => {
    const centered = position.sub(radius)
    const dist = centered.length()
    const falloff = float(1).sub(dist.mul(radius.reciprocal())).max(float(0))

    const noiseCoord = position.mul(noiseScale).add(time)
    const noise = sin(noiseCoord.x).mul(sin(noiseCoord.y)).mul(sin(noiseCoord.z))

    const value = falloff.mul(falloff).mul(noise.add(float(1)).mul(float(0.5))).mul(density)
    return value.clamp(float(0), float(1))
  },
).setLayout({
  name: 'cloudDensity',
  type: 'float',
  inputs: [
    { name: 'position', type: 'vec3' },
    { name: 'radius', type: 'float' },
    { name: 'noiseScale', type: 'float' },
    { name: 'density', type: 'float' },
  ],
})

export function createCloudDensity(position: Vec3Node, options: CloudOptions = {}): FloatNode {
  const radius = float(options.radius ?? 100)
  const noiseScale = float(options.noiseScale ?? 0.05)
  const density = float(options.density ?? 0.7)
  return cloudDensity(position, radius, noiseScale, density)
}


