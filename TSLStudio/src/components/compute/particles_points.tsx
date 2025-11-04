// @ts-nocheck
import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { PointsNodeMaterial } from 'three/webgpu'
import { BufferGeometry, Float32BufferAttribute } from 'three'
import { float, screenSize, vec4, Fn, uv, vec3 } from 'three/tsl'
import type { WebGPURenderer } from 'three/webgpu'
import { createParticleSim, ParticleField } from '@/tsl/compute'

export function ParticlesPoints({
  count = 256 * 256,
  fields = [
    { type: 'curlNoise', amplitude: 0.6, frequency: 1.0, timeFactor: 0.3 },
    { type: 'gravity', direction: [0, -1, 0], strength: 0.1 },
  ] as ParticleField[],
  size = 1.5,
}: {
  count?: number
  fields?: ParticleField[]
  size?: number
}) {
  const sim = useMemo(() => createParticleSim({ count, fields }), [count])

  const material = useMemo(() => {
    const m = new PointsNodeMaterial({ transparent: true, depthWrite: false })

    // Position from buffer attribute
    // @ts-ignore
    m.positionNode = sim.positionAttribute

    // Scale with perspective
    const viewSize = screenSize.y
    const uSize = float(size)
    // @ts-ignore
    m.scaleNode = Fn(() => uSize.mul(0.002).mul(viewSize))()

    // Soft round sprite
    // @ts-ignore
    m.colorNode = Fn(() => {
      const d = uv().sub(0.5).length()
      const alpha = float(0.15).mul(float(0.25).div(d.add(0.1)))
      return vec4(vec3(1.0), alpha.clamp(0.0, 1.0))
    })()

    return m
  }, [sim, size])

  const { gl } = useThree()

  useEffect(() => {
    sim.init(gl as unknown as WebGPURenderer)
  }, [gl, sim])

  useFrame((state, delta) => {
    sim.update(state.gl as unknown as WebGPURenderer, delta)
  })

  const geometry = useMemo(() => {
    const geo = new BufferGeometry()
    const positions = new Float32Array(sim.count * 3)
    const uvs = new Float32Array(sim.count * 2)
    geo.setAttribute('position', new Float32BufferAttribute(positions, 3))
    geo.setAttribute('uv', new Float32BufferAttribute(uvs, 2))
    geo.setDrawRange(0, sim.count)
    return geo
  }, [sim.count])

  useEffect(() => {
    return () => {
      geometry.dispose()
    }
  }, [geometry])

  return (
    <points frustumCulled={false}>
      {/* @ts-ignore */}
      <primitive object={geometry} attach="geometry" />
      {/* @ts-ignore */}
      <primitive object={material} attach="material" />
    </points>
  )
}


