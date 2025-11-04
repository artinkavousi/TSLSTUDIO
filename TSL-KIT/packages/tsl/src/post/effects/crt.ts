import { abs, color, float, length, mix, screenSize, sin, texture, time, uv, vec2, vec3 } from 'three/tsl'

import type { PostEffect } from '../types'; 

export interface CRTEffectOptions {
  curvature?: number
  scanlineIntensity?: number
  vignette?: number
  aberration?: number
  tint?: string
}

export function createCRTEffect({
  curvature = 0.35,
  scanlineIntensity = 0.25,
  vignette = 0.4,
  aberration = 1.0,
  tint = '#ffffff',
}: CRTEffectOptions = {}): PostEffect {
  const curvatureNode = float(Math.max(0, curvature))
  const scanlineNode = float(Math.max(0, scanlineIntensity))
  const vignetteNode = float(Math.max(0, vignette))
  const aberrationNode = vec2(1).div(screenSize).mul(float(Math.max(0, aberration)))
  const tintNode = color(tint)

  return ({ color, input }) => {
    const baseUV = uv()
    const centered = baseUV.sub(vec2(0.5))
    const offset = centered.mul(centered.abs().mul(curvatureNode)).add(centered)
    const warpedUV = offset.add(vec2(0.5))

    const sample = texture(input, warpedUV)

    const chromaOffset = aberrationNode.mul(0.5)
    const red = texture(input, warpedUV.add(chromaOffset)).x
    const blue = texture(input, warpedUV.sub(chromaOffset)).z
    const green = sample.y
    const aberrated = vec3(red, green, blue)

    const scanY = sin(baseUV.y.mul(screenSize.y).mul(3.14159265)).mul(0.5).add(0.5)
    const scanlines = float(1).sub(scanlineNode.mul(scanY))

    const scanMask = sin(baseUV.x.mul(screenSize.x).mul(6.28318)).mul(0.2)
    const mask = vec3(0.9, 1.0, 0.8).add(vec3(scanMask))

    const vignetteAmount = float(1).sub(length(centered.mul(1.25))).mul(float(1).sub(vignetteNode)).clamp(0, 1)
    const glow = sin(time.mul(0.5)).mul(0.02).add(1)

    const crtColor = aberrated.mul(mask).mul(scanlines).mul(vignetteAmount).mul(tintNode).mul(glow)

    return mix(color, crtColor, float(0.85))
  }
}

