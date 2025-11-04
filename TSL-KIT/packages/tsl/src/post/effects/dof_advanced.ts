import type { RenderTarget, Texture } from 'three'
import TextureNode from 'three/src/nodes/accessors/TextureNode.js'
import {
  abs,
  dot,
  float,
  screenSize,
  select,
  texture,
  uv,
  vec2,
  vec3,
  vec4,
} from 'three/tsl'

import type { PostEffect } from '../types'; 

export interface AdvancedDepthOfFieldOptions {
  depthKey?: string
  focusDistance?: number
  focusRange?: number
  maxBlur?: number
  aperture?: number
  blades?: number
  rings?: number
  samplesPerRing?: number
  rotation?: number
  anamorphic?: [number, number]
  highlightBoost?: number
}

const FALLBACK_KERNEL: Array<[number, number]> = [
  [0, 0],
  [0.5, 0],
  [-0.5, 0],
  [0, 0.5],
  [0, -0.5],
  [0.35, 0.35],
  [-0.35, 0.35],
  [0.35, -0.35],
  [-0.35, -0.35],
]

function createIrisKernel(
  blades: number,
  rings: number,
  samplesPerRing: number,
  rotation: number,
  anamorphic: [number, number],
): Array<[number, number]> {
  const kernel: Array<[number, number]> = [[0, 0]]
  const totalPoints = Math.max(1, samplesPerRing) * Math.max(3, blades)
  const rot = rotation
  const [scaleX, scaleY] = anamorphic

  for (let ring = 1; ring <= Math.max(1, rings); ring += 1) {
    const radius = ring / Math.max(1, rings)
    for (let i = 0; i < totalPoints; i += 1) {
      const angle = rot + (i / totalPoints) * Math.PI * 2
      const x = Math.cos(angle)
      const y = Math.sin(angle)

      const bladeFactor = Math.cos((angle * blades) / 2)
      const iris = Math.pow(Math.abs(bladeFactor), 0.6)
      const scaledRadius = radius * iris

      kernel.push([x * scaledRadius * scaleX, y * scaledRadius * scaleY])
    }
  }

  return kernel.length > 1 ? kernel : FALLBACK_KERNEL
}

export function createAdvancedDOFEffect(options: AdvancedDepthOfFieldOptions = {}): PostEffect {
  const depthKey = options.depthKey ?? 'scene.depth'
  const focusDistance = options.focusDistance ?? 1.5
  const focusRange = Math.max(0.0001, options.focusRange ?? 0.6)
  const maxBlur = options.maxBlur ?? 10
  const aperture = options.aperture ?? 1
  const blades = Math.max(3, Math.floor(options.blades ?? 7))
  const rings = Math.max(1, Math.floor(options.rings ?? 3))
  const samplesPerRing = Math.max(1, Math.floor(options.samplesPerRing ?? 4))
  const rotation = options.rotation ?? 0
  const anamorphic = options.anamorphic ?? [1, 1]
  const highlightBoost = options.highlightBoost ?? 0.6

  const kernel = createIrisKernel(blades, rings, samplesPerRing, rotation, anamorphic)
  const kernelNodes = kernel.map(([x, y]) => vec2(x, y))
  const luminanceWeights = vec3(0.299, 0.587, 0.114)
  const highlightBoostNode = float(highlightBoost)
  const maxBlurNode = float(maxBlur)
  const apertureNode = float(aperture)
  const focusNode = float(focusDistance)
  const rangeInvNode = float(1 / focusRange)

  return ({ color, input, resources, size }) => {
    const depthResource = resources.get(depthKey) as RenderTarget | Texture | undefined
    if (!depthResource) {
      return color
    }

    const depthTexture = (depthResource as any).isRenderTarget ? (depthResource as any).texture : depthResource
    const depthTextureNode = new TextureNode(depthTexture)
    const baseDepth = texture(depthTextureNode, uv()).x

    const coc = baseDepth.sub(focusNode).mul(rangeInvNode).clamp(-1, 1)
    const blurMagnitude = coc.abs().mul(maxBlurNode).mul(apertureNode)

    const baseUV = uv()
    const texel = vec2(1).div(screenSize)

    const accum = color.xyz.mul(1)
    const weight = float(1)

    for (const offsetNode of kernelNodes) {
      const sampleOffset = offsetNode.mul(blurMagnitude).mul(texel)
      const sampleUV = baseUV.add(sampleOffset)

      const sampleColor = texture(input, sampleUV).xyz
      const sampleDepth = texture(depthTextureNode, sampleUV).x
      const sampleCoc = sampleDepth.sub(focusNode).mul(rangeInvNode).clamp(-1, 1)

      const sameSide = sampleCoc.mul(coc).greaterThan(0).select(float(1), float(0.2))
      const luminance = dot(sampleColor, luminanceWeights)
      const highlight = float(1).add(luminance.mul(sampleCoc.abs()).mul(highlightBoostNode))
      const sampleWeight = highlight.mul(sameSide)

      accum.addAssign(sampleColor.mul(sampleWeight))
      weight.addAssign(sampleWeight)
    }

    const finalColor = accum.div(weight)
    return vec4(finalColor, color.w)
  }
}

