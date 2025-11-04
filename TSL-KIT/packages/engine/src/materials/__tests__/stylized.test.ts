import { describe, expect, it } from 'vitest'

import { createStylized } from './stylized_helpers'

describe('stylized materials', () => {
  it('creates toon, halftone, hologram, dissolve materials', () => {
    const { toon, halftone, hologram, dissolve } = createStylized()

    expect(toon().material).toBeDefined()
    expect(halftone().material).toBeDefined()
    expect(hologram().material).toBeDefined()
    expect(dissolve().material).toBeDefined()
  })
})

