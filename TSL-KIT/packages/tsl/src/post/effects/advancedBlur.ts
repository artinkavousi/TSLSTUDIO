import { float, screenSize, texture, uv, vec2, vec4 } from 'three/tsl'

import type { PostEffect } from '../types'; 

export type BlurDirection = 'horizontal' | 'vertical' | 'both'

export interface GaussianBlurOptions {
  radius?: number
  sigma?: number
  direction?: BlurDirection
}

function gaussianWeights(radius: number, sigma: number): number[] {
  const weights: number[] = []
  const sigmaSq = sigma * sigma
  let sum = 0
  for (let i = 0; i <= radius; i += 1) {
    const weight = Math.exp((-i * i) / (2 * sigmaSq))
    weights.push(weight)
    sum += i === 0 ? weight : weight * 2
  }
  return weights.map((w) => w / sum)
}

function resolveDirection(direction: BlurDirection): vec2 {
  switch (direction) {
    case 'vertical':
      return vec2(0, 1)
    case 'horizontal':
      return vec2(1, 0)
    default:
      return vec2(1)
  }
}

export function createGaussianBlurEffect(
  { radius = 3, sigma = radius, direction = 'horizontal' }: GaussianBlurOptions = {},
): PostEffect {
  const validRadius = Math.max(1, Math.floor(radius))
  const weights = gaussianWeights(validRadius, sigma || validRadius)
  const orthoDirection = resolveDirection(direction)

  return ({ color, input }) => {
    const baseUV = uv()
    const texel = vec2(1).div(screenSize)
    const dir = orthoDirection.mul(texel)

    let blurred = texture(input, baseUV).mul(float(weights[0]))

    for (let i = 1; i <= validRadius; i += 1) {
      const weight = float(weights[i] ?? 0)
      const offset = dir.mul(float(i))
      const samplePos = texture(input, baseUV.add(offset))
      const sampleNeg = texture(input, baseUV.sub(offset))
      blurred = blurred.add(samplePos.mul(weight)).add(sampleNeg.mul(weight))
    }

    return blurred
  }
}

export interface DirectionalBlurOptions {
  radius?: number
  strength?: number
  direction?: [number, number]
}

export function createDirectionalBlurEffect(
  { radius = 6, strength = 1, direction = [1, 0] }: DirectionalBlurOptions = {},
): PostEffect {
  const weights = gaussianWeights(Math.max(1, Math.floor(radius)), radius || 6)
  const dirVec = vec2(direction[0], direction[1]).normalize()

  return ({ input }) => {
    const baseUV = uv()
    const texel = vec2(1).div(screenSize)
    const dir = dirVec.mul(texel).mul(float(strength))

    let blurred = texture(input, baseUV).mul(float(weights[0]))

    for (let i = 1; i < weights.length; i += 1) {
      const weight = float(weights[i])
      const offset = dir.mul(float(i))
      blurred = blurred
        .add(texture(input, baseUV.add(offset)).mul(weight))
        .add(texture(input, baseUV.sub(offset)).mul(weight))
    }

    return blurred
  }
}

export interface RadialBlurOptions {
  radius?: number
  strength?: number
  center?: [number, number]
}

export function createRadialBlurEffect({ radius = 8, strength = 1, center = [0.5, 0.5] }: RadialBlurOptions = {}): PostEffect {
  const samples = Math.max(2, Math.floor(radius))
  const invSamples = float(1 / samples)
  const strengthNode = float(strength)
  const centerNode = vec2(center[0], center[1])

  return ({ input }) => {
    const baseUV = uv()
    const toCenter = centerNode.sub(baseUV)
    const step = toCenter.mul(strengthNode.mul(invSamples))

    let accum = vec4(0)

    for (let i = 0; i < samples; i += 1) {
      const sampleUV = baseUV.add(step.mul(float(i)))
      accum = accum.add(texture(input, sampleUV))
    }

    return accum.mul(invSamples)
  }
}

