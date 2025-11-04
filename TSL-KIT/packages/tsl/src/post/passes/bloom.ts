import { Fn, float, max, screenSize, texture, uv, vec2, vec3 } from 'three/tsl'

export interface BloomPassParams {
  threshold?: number
  strength?: number
  radius?: number
}

export function bloom({ threshold = 1, strength = 0.5, radius = 1.5 }: BloomPassParams = {}) {
  const offsets = [
    vec2(0, 0),
    vec2(1, 0),
    vec2(-1, 0),
    vec2(0, 1),
    vec2(0, -1),
    vec2(1, 1),
    vec2(-1, 1),
    vec2(1, -1),
    vec2(-1, -1),
  ] as const

  return Fn(([input]) => {
    const baseUV = uv()
    const texel = vec2(1).div(screenSize)
    const radiusNode = texel.mul(float(radius))
    const acc = vec3(0).toVar()

    for (const offset of offsets) {
      const sample = texture(input, baseUV.add(offset.mul(radiusNode))).xyz
      const bright = max(sample.sub(float(threshold)), 0)
      acc.addAssign(bright)
    }

    const avg = acc.div(float(offsets.length))
    return avg.mul(float(strength))
  })
}

