import type { PostEffect } from '@tslstudio/tsl/post/types'; 
import {
  createAdvancedDOFEffect,
  type AdvancedDepthOfFieldOptions,
} from '@tslstudio/tsl/post/effects/dof_advanced'; 

export type AdvancedDOFOptions = AdvancedDepthOfFieldOptions

export function createAdvancedDOF(options?: AdvancedDOFOptions): PostEffect {
  return createAdvancedDOFEffect(options)
}

