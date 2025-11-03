// @ts-nocheck
import { Fn, ShaderNodeObject, cos, float, mat3, mat4, sin, vec3 } from 'three/tsl';
import type { Node } from 'three/webgpu';

export const rotationXYZ = Fn<[ShaderNodeObject<Node>]>(([eulerInput]) => {
  const euler = vec3(eulerInput).toVar();
  const a = float(cos(euler.x)).toVar();
  const b = float(sin(euler.x)).toVar();
  const c = float(cos(euler.y)).toVar();
  const d = float(sin(euler.y)).toVar();
  const e = float(cos(euler.z)).toVar();
  const f = float(sin(euler.z)).toVar();
  const ae = float(a.mul(e)).toVar();
  const af = float(a.mul(f)).toVar();
  const be = float(b.mul(e)).toVar();
  const bf = float(b.mul(f)).toVar();

  return mat3(
    vec3(c.mul(e), af.add(be.mul(d)), bf.sub(ae.mul(d))),
    vec3(c.negate().mul(f), ae.sub(bf.mul(d)), be.add(af.mul(d))),
    vec3(d, b.negate().mul(c), a.mul(c))
  );
});

export const composeTransform = Fn(([positionInput, rotationInput, scaleInput]) => {
  const scale = vec3(scaleInput).toVar();
  const rotation = mat3(rotationInput).toVar();
  const pos = vec3(positionInput).toVar();

  return mat4(
    rotation.element(0).element(0).mul(scale.x),
    rotation.element(0).element(1).mul(scale.x),
    rotation.element(0).element(2).mul(scale.x),
    0.0,
    rotation.element(1).element(0).mul(scale.y),
    rotation.element(1).element(1).mul(scale.y),
    rotation.element(1).element(2).mul(scale.y),
    0.0,
    rotation.element(2).element(0).mul(scale.z),
    rotation.element(2).element(1).mul(scale.z),
    rotation.element(2).element(2).mul(scale.z),
    0.0,
    pos.x,
    pos.y,
    pos.z,
    1.0
  );
});


