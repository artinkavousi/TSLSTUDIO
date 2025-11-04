import { describe, expect, it } from 'vitest'

import { createMaterials } from './helpers'

describe('physical materials', () => {
  it('creates glass presets', () => {
    const { glass } = createMaterials()
    const handle = glass()
    expect(handle.material.metalness).toBe(0)
    expect(handle.nodes.transmission).toBeDefined()
  })

  it('creates brushed metal preset', () => {
    const { metal } = createMaterials()
    const handle = metal({ roughness: 0.2 })
    expect(handle.nodes.baseColor).toBeDefined()
    expect(handle.nodes.anisotropy).toBeDefined()
  })

  it('creates fabric preset', () => {
    const { fabric } = createMaterials()
    const handle = fabric()
    expect(handle.nodes.sheen).toBeDefined()
  })

  it('creates skin preset', () => {
    const { skin } = createMaterials()
    const handle = skin({ subsurface: 0.2 })
    expect(handle.nodes.transmission).toBeDefined()
  })

  it('creates water preset', () => {
    const { water } = createMaterials()
    const handle = water({ thickness: 0.2 })
    expect(handle.nodes.clearcoat).toBeDefined()
  })
})

