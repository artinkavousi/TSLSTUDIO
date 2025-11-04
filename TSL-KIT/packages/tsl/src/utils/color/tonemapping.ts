// @ts-nocheck
import { Fn, vec3, pow, float, mix, smoothstep, exp, div } from 'three/tsl';

export const reinhardTonemap = Fn(([_color]) => {
  return _color.div(_color.add(1.0));
});

export const uncharted2Tonemap = Fn(([_color]) => {
  const A = float(0.15);
  const B = float(0.5);
  const C = float(0.1);
  const D = float(0.2);
  const E = float(0.02);
  const F = float(0.3);
  return _color
    .mul(A)
    .add(_color.mul(_color).mul(B))
    .div(_color.mul(_color).mul(C).add(_color.mul(D)).add(E))
    .sub(F.div(E));
});

export const acesTonemap = Fn(([_color]) => {
  const a = 2.51;
  const b = 0.03;
  const c = 2.43;
  const d = 0.59;
  const e = 0.14;
  return _color
    .mul(a)
    .add(b)
    .div(_color.mul(c).add(_color.mul(d)).add(e))
    .clamp(0.0, 1.0);
});

export const crossProcessTonemap = Fn(([_color]) => {
  const r = pow(_color.x, 0.8);
  const g = pow(_color.y, 1.2);
  const b = pow(_color.z, 1.5);
  return vec3(r, g, b).clamp(0.0, 1.0);
});

export const bleachBypassTonemap = Fn(([_color]) => {
  const lum = _color.dot(vec3(0.2126, 0.7152, 0.0722));
  const mixAmt = 0.7;
  return mix(vec3(lum), _color, mixAmt).mul(1.2).clamp(0.0, 1.0);
});

export const technicolorTonemap = Fn(([_color]) => {
  const r = _color.x.mul(1.5);
  const g = _color.y.mul(1.2);
  const b = _color.z.mul(0.8).add(_color.x.mul(0.2));
  return vec3(r, g, b).clamp(0.0, 1.0);
});

export const cinematicTonemap = Fn(([_color]) => {
  const r = smoothstep(0.05, 0.95, _color.x.mul(0.95).add(0.02));
  const g = smoothstep(0.05, 0.95, _color.y.mul(1.05));
  const b = smoothstep(0.05, 0.95, _color.z.mul(1.1));
  return vec3(r, g, b).clamp(0.0, 1.0);
});

export const tanh = Fn(([val]) => {
  const tmp = exp(val).toVar();
  const tanH = tmp.sub(div(1.0, tmp)).div(tmp.add(div(1.0, tmp)));
  return tanH;
});

export const sinh = Fn(([val]) => {
  const tmp = exp(val).toVar();
  const sinH = tmp.sub(div(1.0, tmp)).div(2.0);
  return sinH;
});

export const cosh = Fn(([val]) => {
  const tmp = exp(val).toVar();
  const cosH = tmp.add(div(1.0, tmp)).div(2.0);
  return cosH;
});


