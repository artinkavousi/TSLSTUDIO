// @ts-nocheck
import { Fn, PI2, hash, instanceIndex, vec3 } from 'three/tsl';

export const positionSphereRand = Fn<{ radius: number }>(({ radius }) => {
  const seed = hash(instanceIndex.add(1));
  const seed2 = hash(instanceIndex.add(2));
  const seed3 = hash(instanceIndex.add(3));

  const distanceFactor = seed.pow(1 / 3);
  const theta = seed2.mul(PI2);
  const phi = seed3.acos().mul(2).sub(1);

  const sinPhi = phi.sin();
  const cosPhi = phi.cos();
  const cosTheta = theta.cos();
  const sinTheta = theta.sin();

  const x = distanceFactor.mul(sinPhi.mul(cosTheta)).mul(radius);
  const y = distanceFactor.mul(sinPhi.mul(sinTheta)).mul(radius);
  const z = distanceFactor.mul(cosPhi).mul(radius);

  return vec3(x, y, z);
});


