import { describe, expect, it } from 'vitest'
import { float, vec3 } from 'three/tsl'

import { createShapeMorph } from '../morphing/shape'; 
import { createTwoWayPositionMorph } from 

describe('animation morphing position', () => {
  it('creates morph handle with internal uniform', () => {
    const handle = createTwoWayPositionMorph({ from: vec3(0), to: vec3(1, 0, 0) })
    expect(handle.positionNode).toBeDefined()
    expect((handle.progressNode as any).value).toBe(0)
    handle.setProgress(0.75)
    expect((handle.progressNode as any).value).toBe(0.75)
  })

  it('uses external progress node and forbids setter', () => {
    const progress = float(0.25)
    const handle = createTwoWayPositionMorph({ from '../morphing/position';


