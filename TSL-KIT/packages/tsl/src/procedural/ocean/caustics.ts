import { Fn, abs, clamp, float, sin, smoothstep, time, vec2 } from 'three/tsl'

import type { FloatNode, Vec2Node, Vec3Node } from '../../index'; 

export interface OceanCausticsOptions {
  scale?: Vec2Node | [number, number]
  speed?: number | FloatNode
  distortion?: number | FloatNode
  intensity?: number | FloatNode
  contrast?: number | FloatNode
  depth?: number | FloatNode
  depthAttenuation?: number | FloatNode
}

const toFloatNode = (value: number | FloatNode | undefined, fallback: number): FloatNode => {
  if (value === undefined) return float(fallback)
  return typeof value === 'number' ? float(value) : value
}

const toVec2Node = (value: Vec2Node | [number, number] | undefined, fallback: [number, number]): Vec2Node => {
  if (value === undefined) return vec2(fallback[0], fallback[1])
  if (Array.isArray(value)) {
    const [x = fallback[0], y = fallback[1]] = value
    return vec2(x, y)
  }
  return value
}

export const oceanCaustics = Fn<readonly [Vec3Node, Vec2Node, FloatNode, FloatNode, FloatNode, FloatNode, FloatNode, FloatNode]>(
  ([position, scale, speed, distortion, intensity, contrast, depth, depthAttenuation]) => {
    const uv = position.xz.mul(scale)
    const t = time.mul(speed)

    const waveA = sin(uv.x.add(t)).mul(sin(uv.y.sub(t)))
    const waveB = sin(uv.y.mul(float(1.3)).add(t.mul(float(1.1)))).mul(sin(uv.x.mul(float(1.7)).sub(t.mul(float(0.7)))))
    const base = waveA.add(waveB).mul(float(0.5))

    const swirl = sin(uv.yx.add(t).mul(distortion)).mul(float(0.25))
    const pattern = base.add(swirl)

    const normalized = pattern.add(float(1)).mul(float(0.5))
    const contrasted = smoothstep(float(0.5).sub(contrast), float(0.5).add(contrast), normalized)

    const causticsValue = contrasted.mul(intensity)

    const attenuation = clamp(float(1).sub(depth.mul(depthAttenuation)), float(0), float(1))
    return clamp(abs(causticsValue).mul(attenuation), float(0), float(1))
  },
).setLayout({
  name: 'oceanCaustics',
  type: 'float',
  inputs: [
    { name: 'position', type: 'vec3' },
    { name: 'scale', type: 'vec2' },
    { name: 'speed', type: 'float' },
    { name: 'distortion', type: 'float' },
    { name: 'intensity', type: 'float' },
    { name: 'contrast', type: 'float' },
    { name: 'depth', type: 'float' },
    { name: 'depthAttenuation', type: 'float' },
  ],
})

export function createOceanCaustics(position: Vec3Node, options: OceanCausticsOptions = {}): FloatNode {
  const scale = toVec2Node(options.scale, [3, 2.1])
  const speed = toFloatNode(options.speed, 1.1)
  const distortion = toFloatNode(options.distortion, 1.4)
  const intensity = toFloatNode(options.intensity, 1.6)
  const contrast = toFloatNode(options.contrast, 0.28)
  const depth = toFloatNode(options.depth, 0)
  const depthAttenuation = toFloatNode(options.depthAttenuation, 0.35)

  return oceanCaustics(position, scale, speed, distortion, intensity, contrast, depth, depthAttenuation)
}


