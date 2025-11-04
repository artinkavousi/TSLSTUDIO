export interface PressureIterationUniform {
  i: number
  offsetCurrent: number
  offsetNext: number
  current: number
  next: number
  dx: number
}

export const ITERATION_UNIFORM_STRUCT = /* wgsl */ `
struct Iter {
    i: u32,
    offsetCurrent: u32,
    offsetNext: u32,
    current: u32,
    next: u32,
    dx: f32,
};
`

