import { describe, expect, it } from 'vitest'
import { PerspectiveCamera, Vector2 } from 'three'
import { float, vec3, vec4 } from 'three/tsl'

import type { EffectResources } from '@tslstudio/tsl/post/types'; 

import {
  createGTAOEffect,
  createSSGIEffect,
  createSSREffect,
  resolveScreenSpaceConfig,
} from '../screenspace'; 
import { FX_RESOURCE_KEYS } from '../pass'; 

const makeResources = () => {
  const map = new Map<string, unknown>()
  map.set(FX_RESOURCE_KEYS.color, vec4(vec3(1), float(1)))
  map.set(FX_RESOURCE_KEYS.depth, float(0.5))
  map.set(FX_RESOURCE_KEYS.normal, vec3(0, 1, 0))
  map.set(FX_RESOURCE_KEYS.metalness, float(0.5))
  map.set(FX_RESOURCE_KEYS.roughness, float(0.25))
  map.set(FX_RESOURCE_KEYS.diffuse, vec4(vec3(0.8), float(1)))
  map.set(FX_RESOURCE_KEYS.camera, new PerspectiveCamera())
  return map
}

const makeContext = (resources: Map<string, unknown>) => ({
  color: vec3(1),
  input: vec4(vec3(1), float(1)),
  resources: resources as unknown as EffectResources,
  frame: 0,
  size: new Vector2(800, 600),
})

describe('screenspace effects', () => {
  it('creates SSR nodes without throwing', () => {
    const resources = makeResources()
    const effect = createSSREffect()
    expect(() => effect(makeContext(resources))).not.toThrow()
    expect(resources.has('fx.state.ssr')).toBe(true)
  })

  it('creates GTAO nodes without throwing', () => {
    const resources = makeResources()
    const effect = createGTAOEffect()
    expect(() => effect(makeContext(resources))).not.toThrow()
    expect(resources.has('fx.state.gtao')).toBe(true)
  })

  it('creates SSGI nodes without throwing', () => {
    const resources = makeResources()
    const effect = createSSGIEffect()
    expect(() => effect(makeContext(resources))).not.toThrow()
    expect(resources.has('fx.state.ssgi')).toBe(true)
  })

  it('allows disabling temporal accumulation per effect', () => {
    const resources = makeResources()
    const effect = createSSREffect({ temporal: { enabled: false } })
    expect(() => effect(makeContext(resources))).not.toThrow()
  })

  it('applies screen-space quality presets with overrides', () => {
    const resolved = resolveScreenSpaceConfig({
      quality: 'balanced',
      ssr: { quality: 0.9 },
      gtao: true,
      ssgi: { temporal: { clampStrength: 0.2 } },
    })

    expect(resolved.ssr?.quality).toBe(0.9)
    expect(resolved.ssr?.temporal?.historyWeight).toBeCloseTo(0.86)
    expect(resolved.gtao?.samples).toBe(12)
    expect(resolved.ssgi?.temporal?.clampStrength).toBe(0.2)
  })

  it('disables effects explicitly set to false', () => {
    const resolved = resolveScreenSpaceConfig({ quality: 'high', ssr: false })
    expect(resolved.ssr).toBeUndefined()
  })
})

