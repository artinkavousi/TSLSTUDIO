import { Data3DTexture, FloatType, LinearFilter, RGBFormat } from 'three'

import {
  createColorGradingEffect,
  type ColorGradingOptions,
} from '@tslstudio/tsl/post/effects/colorgrading'; 
import {
  createColorCurvesEffect,
  type ColorCurvesOptions,
} from '@tslstudio/tsl/post/effects/colorCurves'; 
import type { PostEffect } from '@tslstudio/tsl/post/types'; 

export type TonemapCurve = NonNullable<ColorGradingOptions['tonemapCurve']>

export interface ColorGradingPipelineOptions extends Omit<ColorGradingOptions, 'lut'> {
  lut?: Data3DTexture
  curves?: ColorCurvesOptions | false
}

export function createColorGradingPipeline(options: ColorGradingPipelineOptions = {}): PostEffect[] {
  const effects: PostEffect[] = []

  if (options.curves) {
    effects.push(createColorCurvesEffect(options.curves))
  }

  effects.push(
    createColorGradingEffect({
      lut: options.lut,
      exposure: options.exposure,
      intensity: options.intensity,
      gamma: options.gamma,
      tonemapCurve: options.tonemapCurve,
    }),
  )

  return effects
}

export function createIdentityLUT(size = 32): Data3DTexture {
  const dimension = Math.max(2, Math.floor(size))
  const data = new Float32Array(dimension * dimension * dimension * 3)
  let index = 0
  for (let b = 0; b < dimension; b += 1) {
    for (let g = 0; g < dimension; g += 1) {
      for (let r = 0; r < dimension; r += 1) {
        data[index++] = r / (dimension - 1)
        data[index++] = g / (dimension - 1)
        data[index++] = b / (dimension - 1)
      }
    }
  }

  const texture = new Data3DTexture(data, dimension, dimension, dimension)
  texture.type = FloatType
  texture.format = RGBFormat
  texture.minFilter = LinearFilter
  texture.magFilter = LinearFilter
  texture.generateMipmaps = false
  texture.needsUpdate = true
  return texture
}

export type ColorGradingPresetName = 'cinematic' | 'vibrant' | 'retroFilm'

export interface ColorGradingPreset {
  name: ColorGradingPresetName
  label: string
  options: ColorGradingPipelineOptions
}

const PRESETS: Record<ColorGradingPresetName, ColorGradingPreset> = {
  cinematic: {
    name: 'cinematic',
    label: 'Cinematic',
    options: {
      exposure: 0.35,
      gamma: 0.95,
      tonemapCurve: 'ACES',
      curves: {
        slope: [1.05, 1.0, 0.95],
        offset: [-0.01, -0.005, 0],
        power: [1.05, 1.02, 1.0],
        lift: [-0.02, -0.01, 0],
        gamma: [1.03, 1.0, 0.98],
        gain: [1.08, 1.05, 1.02],
        saturation: 1.08,
        contrast: 1.1,
      },
    },
  },
  vibrant: {
    name: 'vibrant',
    label: 'Vibrant',
    options: {
      exposure: 0.1,
      gamma: 0.9,
      tonemapCurve: 'Reinhard',
      curves: {
        slope: [1.1, 1.05, 1],
        lift: [-0.015, -0.005, 0.005],
        gain: [1.1, 1.05, 1.02],
        saturation: 1.2,
        contrast: 1.05,
      },
    },
  },
  retroFilm: {
    name: 'retroFilm',
    label: 'Retro Film',
    options: {
      exposure: -0.2,
      gamma: 1.05,
      tonemapCurve: 'Uncharted2',
      curves: {
        slope: [0.95, 0.98, 1.02],
        lift: [0.04, 0.025, 0.01],
        gain: [1.02, 0.98, 0.95],
        saturation: 0.8,
        contrast: 0.95,
      },
    },
  },
}

export const colorGradingPresets = Object.values(PRESETS)

export function getColorGradingPreset(name: ColorGradingPresetName): ColorGradingPreset {
  return PRESETS[name]
}

export function createPresetColorGrading(name: ColorGradingPresetName): PostEffect[] {
  const preset = getColorGradingPreset(name)
  return createColorGradingPipeline(preset.options)
}

