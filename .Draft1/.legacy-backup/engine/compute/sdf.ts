// @ts-nocheck
import { Fn, vec2, vec3, float, max, min, abs, length, dot, Loop, If } from 'three/tsl'
import type { NodeRepresentation } from 'three/tsl'

export type SDFNode = ReturnType<typeof Fn>

export const sdfSphere = Fn(([_p, radius = 1]) => {
  const p = vec3(_p)
  return length(p).sub(float(radius))
})

export const sdfBox = Fn(([_p, dimensions]) => {
  const p = vec3(_p)
  const b = vec3(dimensions)
  const d = abs(p).sub(b)
  const outside = max(d, 0.0)
  return length(outside).add(min(max(d.x, max(d.y, d.z)), 0.0))
})

export const sdfTorus = Fn(([_p, radius = vec2(0.6, 0.2)]) => {
  const p = vec3(_p)
  const q = vec2(length(vec2(p.x, p.z)).sub(radius.x), p.y)
  return length(q).sub(radius.y)
})

export const sdfPlane = Fn(([_p, normal = vec3(0, 1, 0), height = 0]) => {
  const p = vec3(_p)
  return dot(p, normal.normalize()).add(float(height))
})

export const opUnion = Fn(([d1, d2]) => min(float(d1), float(d2)))
export const opSmoothUnion = Fn(([d1, d2, k = 0.2]) => {
  const a = float(d1)
  const b = float(d2)
  const h = max(k.sub(abs(a.sub(b))).div(k), 0.0)
  return min(a, b).sub(h.mul(h).mul(k).mul(0.25))
})

export const opIntersect = Fn(([d1, d2]) => max(float(d1), float(d2)))
export const opSubtract = Fn(([d1, d2]) => max(float(d1).negate(), float(d2)))

export function createSDFRaymarcher(
  sdf: (position: NodeRepresentation) => NodeRepresentation,
  opts: {
    maxSteps?: number
    maxDistance?: number
    hitThreshold?: number
  } = {},
) {
  const maxSteps = opts.maxSteps ?? 128
  const maxDistance = float(opts.maxDistance ?? 200)
  const hitThreshold = float(opts.hitThreshold ?? 0.001)

  return Fn(([origin, direction]) => {
    const o = vec3(origin)
    const dir = vec3(direction).normalize()
    const distanceTravelled = float(0).toVar()
    const hit = float(0).toVar()

    Loop({ start: 0, end: maxSteps }, () => {
      If(hit.lessThan(0.5), () => {
        If(distanceTravelled.lessThan(maxDistance), () => {
        const currentPos = o.add(dir.mul(distanceTravelled))
        const dist = float(sdf(currentPos))
        distanceTravelled.addAssign(dist)
        If(dist.abs().lessThan(hitThreshold), () => {
          hit.assign(1)
        })
        })
      })
    })

    return vec2(distanceTravelled, hit)
  })
}


