import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { PointsNodeMaterial } from 'three/webgpu'
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

  // Provide dummy position/uv attributes to satisfy Node builder expectations
  const positionArray = useMemo(() => new Float32Array(sim.count * 3), [sim.count])
  const uvArray = useMemo(() => new Float32Array(sim.count * 2), [sim.count])

  const geoRef = useRef<THREE.BufferGeometry>(null)
  useEffect(() => {
    const g = geoRef.current
    if (g) {
      // Ensure non-zero draw count for Points
      g.setDrawRange(0, sim.count)
    }
  }, [sim.count])

  return (
    <points frustumCulled={false}>
      <bufferGeometry attach="geometry" ref={geoRef}>
        {/* These attributes define the draw count for the Points geometry */}
        {/* @ts-ignore */}
        <bufferAttribute attach="attributes-position" args={[positionArray, 3]} />
        {/* @ts-ignore */}
        <bufferAttribute attach="attributes-uv" args={[uvArray, 2]} />
      </bufferGeometry>
      {/* @ts-ignore */}
      <primitive object={material} attach="material" />
    </points>
  )
}


