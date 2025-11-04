import type { PostEffect } from '@tslstudio/tsl/post/types'; 
import type { AdvancedDOFOptions } from './dof'; 
import type { ColorGradingPipelineOptions } from './colorGrading'; 
import {
  createAsciiEffect,
  createCRTEffect,
  createDuotoneEffect,
  createFilmGrainEffect,
  createGlitchEffect,
  createPosterizeEffect,
  createVignetteEffect,
} from '@tslstudio/tsl/post/effects/ascii'; 

export type FXPresetName = 'retro' | 'noir' | 'arcade'

export interface FXPresetOptions {
  intensity?: number
  dof?: AdvancedDOFOptions | false
  colorGrading?: ColorGradingPipelineOptions | false
}

export function createRetroEffects(options: FXPresetOptions = {}): PostEffect[] {
  const intensity = options.intensity ?? 1
  return [
    createFilmGrainEffect({ amount: 0.05 * intensity, monochrome: false, timeFactor: 0.35 }),
    createGlitchEffect({ amount: 0.03 * intensity, speed: 2.2, slices: 32 }),
    createCRTEffect({
      curvature: 0.35,
      scanlineIntensity: 0.35 * intensity,
      vignette: 0.45,
      aberration: 0.9,
      tint: '#fbe7d4',
    }),
    createDuotoneEffect({
      shadows: '#1c1b33',
      highlights: '#ff8a65',
      midpoint: 0.42,
      softness: 0.35,
      intensity,
    }),
  ]
}

export function createNoirEffects(options: FXPresetOptions = {}): PostEffect[] {
  const intensity = options.intensity ?? 1
  return [
    createPosterizeEffect({ levels: 4, gamma: 0.9, intensity }),
    createDuotoneEffect({
      shadows: '#050505',
      highlights: '#f5f2e7',
      midpoint: 0.5,
      softness: 0.2,
      intensity,
    }),
    createVignetteEffect({ intensity: 0.7 * intensity, smoothness: 0.4, exponent: 1.9 }),
    createFilmGrainEffect({ amount: 0.025 * intensity, monochrome: true, timeFactor: 0.2 }),
  ]
}

export function createArcadeEffects(options: FXPresetOptions = {}): PostEffect[] {
  const intensity = options.intensity ?? 1
  return [
    createAsciiEffect({ cellSize: 10, contrast: 1.4 * intensity, intensity: 0.75 * intensity, tint: '#40ff9c' }),
    createGlitchEffect({ amount: 0.05 * intensity, speed: 3.2, slices: 28 }),
    createFilmGrainEffect({ amount: 0.04 * intensity, monochrome: false, timeFactor: 0.45 }),
    createCRTEffect({ curvature: 0.25, scanlineIntensity: 0.2 * intensity, vignette: 0.35, aberration: 1.1, tint: '#d0f6ff' }),
  ]
}

export function createPresetEffects(preset: FXPresetName, options: FXPresetOptions = {}): PostEffect[] {
  switch (preset) {
    case 'retro':
      return createRetroEffects(options)
    case 'noir':
      return createNoirEffects(options)
    case 'arcade':
      return createArcadeEffects(options)
    default:
      return []
  }
}

