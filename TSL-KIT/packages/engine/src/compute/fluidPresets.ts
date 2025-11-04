import type { FluidSimulationHandle, FluidScenario } from './fluid'; 

export type FluidPresetName = 'smokeColumn' | 'fireJet' | 'fiveSpheres' | 'vortexChamber'

export interface FluidPreset {
  name: FluidPresetName
  label: string
  scenario: FluidScenario
  uniforms?: Partial<FluidSimulationHandle['uniforms']>
  description?: string
}

const PRESETS: Record<FluidPresetName, FluidPreset> = {
  smokeColumn: {
    name: 'smokeColumn',
    label: 'Smoke Column',
    scenario: 'smoke',
    description: 'Slow rising column of dense smoke cooled by ambient decay.',
    uniforms: {
      brushSmokeAmount: 3,
      brushFuelAmount: 0,
      brushTemperatureAmount: 0,
      smokeDecay: 0.35,
      temperatureDecay: 1.2,
      pressureDecay: 1.5,
      velocityDecay: 0.025,
      stepLength: 0.012,
    } satisfies Partial<FluidSimulationHandle['uniforms']>,
  },
  fireJet: {
    name: 'fireJet',
    label: 'Fire Jet',
    scenario: 'fire',
    description: 'High temperature fire jet with strong buoyancy and fuel emission.',
    uniforms: {
      brushFuelAmount: 0.22,
      brushTemperatureAmount: 1.6,
      brushSmokeAmount: 0.4,
      ignitionTemperature: 480,
      burnHeatEmit: 26000,
      burnSmokeEmit: 0.75,
      boyancy: 0.85,
      smokeDecay: 0.6,
      temperatureDecay: 0.6,
      stepLength: 0.01,
    },
  },
  fiveSpheres: {
    name: 'fiveSpheres',
    label: 'Five Spheres',
    scenario: 'spheres',
    description: 'Dancing multi-emitter setup showcasing colour/lighting variations.',
    uniforms: {
      brushVelocityAmount: 3.5,
      brushSmokeAmount: 2.2,
      brushTemperatureAmount: 0.9,
      smokeDecay: 0.45,
      pressureDecay: 1.3,
      vorticity: 1.5,
    },
  },
  vortexChamber: {
    name: 'vortexChamber',
    label: 'Vortex Chamber',
    scenario: 'vortex',
    description: 'Enclosed vortex with gradual temperature falloff and strong swirl.',
    uniforms: {
      brushVelocityAmount: 2.8,
      brushSmokeAmount: 1.2,
      brushFuelAmount: 0,
      smokeDecay: 0.3,
      pressureDecay: 1.0,
      temperatureDecay: 0.9,
      boyancy: 0.35,
      stepLength: 0.009,
    },
  },
}

export const fluidPresets = Object.values(PRESETS)

export function getFluidPreset(name: FluidPresetName): FluidPreset {
  return PRESETS[name]
}

export function applyFluidPreset(simulation: FluidSimulationHandle, name: FluidPresetName): void {
  const preset = getFluidPreset(name)
  simulation.setScenario(preset.scenario)
  if (preset.uniforms) {
    simulation.updateUniforms(preset.uniforms)
  }
}

export interface FluidControlMetadata {
  key: keyof FluidSimulationHandle['uniforms']
  label: string
  min: number
  max: number
  step: number
  default: number
}

export const fluidControlSchema: FluidControlMetadata[] = [
  { key: 'brushSmokeAmount', label: 'Smoke Amount', min: 0, max: 5, step: 0.05, default: 0 },
  { key: 'brushFuelAmount', label: 'Fuel Amount', min: 0, max: 1, step: 0.01, default: 0.15 },
  { key: 'brushTemperatureAmount', label: 'Temperature', min: -2, max: 2, step: 0.01, default: 1 },
  { key: 'smokeDecay', label: 'Smoke Decay', min: 0.05, max: 2.5, step: 0.01, default: 0.5 },
  { key: 'temperatureDecay', label: 'Temperature Decay', min: 0.05, max: 2.5, step: 0.01, default: 1 },
  { key: 'pressureDecay', label: 'Pressure Decay', min: 0.5, max: 5, step: 0.05, default: 1.5 },
  { key: 'boyancy', label: 'Buoyancy', min: 0, max: 2.5, step: 0.01, default: 0.5 },
  { key: 'vorticity', label: 'Vorticity', min: 0, max: 5, step: 0.05, default: 1 },
  { key: 'stepLength', label: 'Ray March Step', min: 0.002, max: 0.03, step: 0.001, default: 0.01 },
]

