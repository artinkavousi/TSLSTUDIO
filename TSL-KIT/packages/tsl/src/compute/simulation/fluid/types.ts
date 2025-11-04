export interface FluidUniforms {
  x: number
  y: number
  z: number
  ux: number
  uy: number
  uz: number
  dx: number
  rdx: number
  pressureDecay: number
  vorticity: number
  dt: number
  t: number
  mouseStartX: number
  mouseStartY: number
  mouseEndX: number
  mouseEndY: number
  brushSmokeAmount: number
  brushFuelAmount: number
  smokeDecay: number
  temperatureDecay: number
  ignitionTemperature: number
  burnRate: number
  burnHeatEmit: number
  burnSmokeEmit: number
  smokeR: number
  smokeG: number
  smokeB: number
  boyancy: number
  brushVelocityAmount: number
  brushSize: number
  velocityDecay: number
  canvasX: number
  canvasY: number
  canvasiX: number
  canvasiY: number
  camPosX: number
  camPosY: number
  camPosZ: number
  stepLength: number
  enclosed: number
  emitterR: number
  emitterG: number
  emitterB: number
  blackbodyBrightness: number
  brushTemperatureAmount: number
  orthoBlend: number
  glowRadius: number
  glowStrength: number
  glowGamma: number
}

export type FluidField = 'velocity' | 'smoke' | 'temperature' | 'pressure'

