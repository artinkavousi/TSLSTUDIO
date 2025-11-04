// @ts-nocheck
import {
  Fn,
  vec2,
  vec4,
  float,
  storage,
  instanceIndex,
  mod,
  floor,
  mix,
  clamp,
  length,
  If,
} from 'three/tsl'
import { StorageInstancedBufferAttribute } from 'three/webgpu'
import type { WebGPURenderer } from 'three/webgpu'

type GridBuffers = {
  velocity: ReturnType<typeof storage>
  velocitySwap: ReturnType<typeof storage>
  density: ReturnType<typeof storage>
  densitySwap: ReturnType<typeof storage>
  pressure: ReturnType<typeof storage>
  divergence: ReturnType<typeof storage>
}

export type Fluid2DConfig = {
  width: number
  height: number
  viscosity?: number
  dissipation?: number
  pressureIterations?: number
}

export type FluidImpulse = {
  position: [number, number]
  radius: number
  velocity?: [number, number]
  density?: number
}

export type Fluid2DSimulation = {
  readonly width: number
  readonly height: number
  readonly buffers: GridBuffers
  step(renderer: WebGPURenderer, deltaSeconds: number): void
  addImpulse(renderer: WebGPURenderer, impulse: FluidImpulse): void
  dispose(): void
}

function createGridBuffer(count: number, itemSize: number) {
  return storage(new StorageInstancedBufferAttribute(count, itemSize), itemSize === 1 ? 'float' : 'vec4', count)
}

function indexToCoord(width: ReturnType<typeof float>, idx: ReturnType<typeof float>) {
  const x = mod(idx, width)
  const y = floor(idx.div(width))
  return vec2(x, y)
}

function coordToIndex(width: ReturnType<typeof float>, coord: ReturnType<typeof vec2>) {
  return coord.x.add(coord.y.mul(width)).floor()
}

export function createFluid2D(config: Fluid2DConfig): Fluid2DSimulation {
  const width = Math.max(4, config.width | 0)
  const height = Math.max(4, config.height | 0)
  const viscosity = config.viscosity ?? 0.0001
  const dissipation = config.dissipation ?? 0.995
  const pressureIterations = Math.max(1, config.pressureIterations ?? 10)

  const cellCount = width * height

  const buffers: GridBuffers = {
    velocity: createGridBuffer(cellCount, 4),
    velocitySwap: createGridBuffer(cellCount, 4),
    density: createGridBuffer(cellCount, 1),
    densitySwap: createGridBuffer(cellCount, 1),
    pressure: createGridBuffer(cellCount, 1),
    divergence: createGridBuffer(cellCount, 1),
  }

  const uWidth = float(width)
  const uHeight = float(height)
  const uViscosity = float(viscosity)
  const uDissipation = float(dissipation)
  const uDelta = float(0.016)

  const advectField = (
    source: ReturnType<typeof storage>,
    destination: ReturnType<typeof storage>,
    isVector: boolean,
  ) =>
    Fn(() => {
      const idx = float(instanceIndex)
      const coord = indexToCoord(uWidth, idx)
      const uv = coord.add(vec2(0.5))
      const velocityElement = buffers.velocity.element(idx)
      const velocity = vec2(velocityElement.x, velocityElement.y)
      const dt = uDelta
      const backCoord = uv.sub(velocity.mul(vec2(uWidth, uHeight)).mul(dt))
      const clamped = vec2(
        clamp(backCoord.x, 0.5, uWidth.sub(1.5)),
        clamp(backCoord.y, 0.5, uHeight.sub(1.5)),
      )
      const floorCoord = floor(clamped)
      const frac = clamped.sub(floorCoord)

      const c00Index = coordToIndex(uWidth, floorCoord)
      const c10Index = coordToIndex(uWidth, floorCoord.add(vec2(1, 0)))
      const c01Index = coordToIndex(uWidth, floorCoord.add(vec2(0, 1)))
      const c11Index = coordToIndex(uWidth, floorCoord.add(vec2(1, 1)))

      const sample = (buffer: ReturnType<typeof storage>) => {
        const s00 = buffer.element(c00Index)
        const s10 = buffer.element(c10Index)
        const s01 = buffer.element(c01Index)
        const s11 = buffer.element(c11Index)
        const s0 = mix(s00, s10, frac.x)
        const s1 = mix(s01, s11, frac.x)
        return mix(s0, s1, frac.y)
      }

      const value = sample(source)
      if (isVector) {
        const prev = destination.element(idx)
        const newXY = vec2(value.x, value.y)
        destination.element(idx).assign(vec4(newXY.x, newXY.y, prev.z, prev.w))
      } else {
        destination.element(idx).assign(value)
      }
    }).compute(cellCount)

  const computeDivergence = Fn(() => {
    const idx = float(instanceIndex)
    const coord = indexToCoord(uWidth, idx)
    const leftCoord = vec2(clamp(coord.x.sub(1), float(0), uWidth.sub(1)), coord.y)
    const rightCoord = vec2(clamp(coord.x.add(1), float(0), uWidth.sub(1)), coord.y)
    const downCoord = vec2(coord.x, clamp(coord.y.sub(1), float(0), uHeight.sub(1)))
    const upCoord = vec2(coord.x, clamp(coord.y.add(1), float(0), uHeight.sub(1)))

    const left = buffers.velocity.element(coordToIndex(uWidth, leftCoord))
    const right = buffers.velocity.element(coordToIndex(uWidth, rightCoord))
    const down = buffers.velocity.element(coordToIndex(uWidth, downCoord))
    const up = buffers.velocity.element(coordToIndex(uWidth, upCoord))

    const h = float(1)
    const div = right.x.sub(left.x).add(up.y.sub(down.y)).mul(0.5).div(h)
    buffers.divergence.element(idx).assign(div)
    buffers.pressure.element(idx).assign(0)
  }).compute(cellCount)

  const pressureSolve = Fn(() => {
    const idx = float(instanceIndex)
    const coord = indexToCoord(uWidth, idx)
    const leftCoord = vec2(clamp(coord.x.sub(1), float(0), uWidth.sub(1)), coord.y)
    const rightCoord = vec2(clamp(coord.x.add(1), float(0), uWidth.sub(1)), coord.y)
    const downCoord = vec2(coord.x, clamp(coord.y.sub(1), float(0), uHeight.sub(1)))
    const upCoord = vec2(coord.x, clamp(coord.y.add(1), float(0), uHeight.sub(1)))

    const left = buffers.pressure.element(coordToIndex(uWidth, leftCoord))
    const right = buffers.pressure.element(coordToIndex(uWidth, rightCoord))
    const down = buffers.pressure.element(coordToIndex(uWidth, downCoord))
    const up = buffers.pressure.element(coordToIndex(uWidth, upCoord))
    const div = buffers.divergence.element(idx)

    const pressure = left.add(right).add(up).add(down).sub(div).div(4)
    buffers.pressure.element(idx).assign(pressure)
  }).compute(cellCount)

  const subtractGradient = Fn(() => {
    const idx = float(instanceIndex)
    const coord = indexToCoord(uWidth, idx)
    const leftCoord = vec2(clamp(coord.x.sub(1), float(0), uWidth.sub(1)), coord.y)
    const rightCoord = vec2(clamp(coord.x.add(1), float(0), uWidth.sub(1)), coord.y)
    const downCoord = vec2(coord.x, clamp(coord.y.sub(1), float(0), uHeight.sub(1)))
    const upCoord = vec2(coord.x, clamp(coord.y.add(1), float(0), uHeight.sub(1)))

    const left = buffers.pressure.element(coordToIndex(uWidth, leftCoord))
    const right = buffers.pressure.element(coordToIndex(uWidth, rightCoord))
    const down = buffers.pressure.element(coordToIndex(uWidth, downCoord))
    const up = buffers.pressure.element(coordToIndex(uWidth, upCoord))

    const grad = vec2(right.sub(left), up.sub(down)).mul(0.5)
    const v = buffers.velocity.element(idx)
    const xy = vec2(v.x, v.y).sub(grad)
    buffers.velocity.element(idx).assign(vec4(xy.x, xy.y, v.z, v.w))
  }).compute(cellCount)

  const applyDissipation = Fn(() => {
    const idx = float(instanceIndex)
    const v = buffers.velocity.element(idx)
    const viscosityFactor = float(1).sub(uViscosity.mul(uDelta)).clamp(0.0, 1.0)
    const xy = vec2(v.x, v.y).mul(uDissipation).mul(viscosityFactor)
    buffers.velocity.element(idx).assign(vec4(xy.x, xy.y, v.z, v.w))
    const d = buffers.density.element(idx)
    buffers.density.element(idx).assign(float(d).mul(uDissipation).mul(viscosityFactor))
  }).compute(cellCount)

  const swapVelocity = () => {
    const temp = buffers.velocity
    buffers.velocity = buffers.velocitySwap
    buffers.velocitySwap = temp
  }

  const swapDensity = () => {
    const temp = buffers.density
    buffers.density = buffers.densitySwap
    buffers.densitySwap = temp
  }

  return {
    width,
    height,
    buffers,
    step(renderer, deltaSeconds) {
      uDelta.value = deltaSeconds
      renderer.compute(advectField(buffers.velocity, buffers.velocitySwap, true))
      swapVelocity()
      renderer.compute(advectField(buffers.density, buffers.densitySwap, false))
      swapDensity()
      renderer.compute(applyDissipation)
      renderer.compute(computeDivergence)
      for (let i = 0; i < pressureIterations; i++) {
        renderer.compute(pressureSolve)
      }
      renderer.compute(subtractGradient)
    },
    addImpulse(renderer, impulse) {
      const { position, radius, velocity, density } = impulse
      const uPos = vec2(position[0], position[1])
      const uRadius = float(radius)
      const vel = velocity ? vec2(velocity[0], velocity[1]) : vec2(0)
      const dens = float(density ?? 0)

      const applyImpulse = Fn(() => {
        const idx = float(instanceIndex)
        const coord = indexToCoord(uWidth, idx)
        const cellCenter = coord.add(vec2(0.5))
        const dist = length(cellCenter.sub(uPos))
        const influence = clamp(float(1).sub(dist.div(uRadius)), 0.0, 1.0)
        If(influence.greaterThan(0.0001), () => {
        const v = buffers.velocity.element(idx)
        const xy = vec2(v.x, v.y).add(vel.mul(influence))
        buffers.velocity.element(idx).assign(vec4(xy.x, xy.y, v.z, v.w))
          const d = buffers.density.element(idx)
          buffers.density.element(idx).assign(float(d).add(dens.mul(influence)))
        })
      }).compute(cellCount)

      renderer.compute(applyImpulse)
    },
    dispose() {
      buffers.velocity.array?.dispose?.()
      buffers.velocitySwap.array?.dispose?.()
      buffers.density.array?.dispose?.()
      buffers.densitySwap.array?.dispose?.()
      buffers.pressure.array?.dispose?.()
      buffers.divergence.array?.dispose?.()
    },
  }
}


