import { clamp, mix, pow, vec3 } from 'three/tsl';

export function fresnelDielectric(ior = 1.45) {
  const f0 = Math.pow((1 - ior) / (1 + ior), 2);
  return vec3(f0, f0, f0);
}

export function fresnelSchlick(cosTheta: number, f0: number, f90 = 1) {
  return clamp(mix(f0, f90, pow(1 - cosTheta, 5)), 0, 1);
}



