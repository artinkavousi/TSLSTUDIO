import type { PostEffect } from '@tslstudio/tsl/post/types'; 
import {
  createGaussianBlurEffect,
  createDirectionalBlurEffect,
  createRadialBlurEffect,
  type GaussianBlurOptions,
  type DirectionalBlurOptions,
  type RadialBlurOptions,
} from '@tslstudio/tsl/post/effects/advancedBlur'; 

export interface SeparableGaussianOptions extends Omit<GaussianBlurOptions, 'direction'> {
  iterations?: number
}

export function createSeparableGaussianEffects(options: SeparableGaussianOptions = {}): PostEffect[] {
  const { iterations = 1, ...rest } = options
  const passes: PostEffect[] = []
  for (let i = 0; i < iterations; i += 1) {
    passes.push(createGaussianBlurEffect({ ...rest, direction: 'horizontal' }))
    passes.push(createGaussianBlurEffect({ ...rest, direction: 'vertical' }))
  }
  return passes
}

export function createDirectionalBlur(options?: DirectionalBlurOptions): PostEffect {
  return createDirectionalBlurEffect(options)
}

export function createRadialBlur(options?: RadialBlurOptions): PostEffect {
  return createRadialBlurEffect(options)
}

