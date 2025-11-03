// @ts-nocheck
// Three.js TSL helpers harvested from production WebGPU pipelines.

import {
  Fn,
  If,
  PI,
  abs,
  add,
  any,
  clamp,
  cos,
  div,
  dot,
  float,
  floor,
  fract,
  greaterThan,
  hash,
  mat3,
  max,
  min,
  mix,
  mod,
  mul,
  normalize,
  overloadingFn,
  property,
  sin,
  sqrt,
  step,
  sub,
  vec2,
  vec3,
  vec4
} from 'three/tsl';

// ---------------------------------------------------------------------------
// Simplex noise (scalar + vector variants)
// ---------------------------------------------------------------------------

const mod289Vec3 = Fn(([x]) => {
  const v = vec3(x).toVar();
  return v.sub(floor(v.mul(1.0 / 289.0)).mul(289.0));
}).setLayout({
  name: 'mod289_vec3',
  type: 'vec3',
  inputs: [{ name: 'x', type: 'vec3' }]
});

const mod289Vec4 = Fn(([x]) => {
  const v = vec4(x).toVar();
  return v.sub(floor(v.mul(1.0 / 289.0)).mul(289.0));
}).setLayout({
  name: 'mod289_vec4',
  type: 'vec4',
  inputs: [{ name: 'x', type: 'vec4' }]
});

const mod289 = overloadingFn([mod289Vec3, mod289Vec4]);

const permuteNoise = Fn(([x]) => {
  const v = vec4(x).toVar();
  return mod289(v.mul(34.0).add(1.0).mul(v));
}).setLayout({
  name: 'permuteNoise',
  type: 'vec4',
  inputs: [{ name: 'x', type: 'vec4' }]
});

const taylorInvSqrt4 = Fn(([r]) => {
  const v = vec4(r).toVar();
  return sub(1.79284291400159, mul(0.85373472095314, v));
}).setLayout({
  name: 'taylorInvSqrt4',
  type: 'vec4',
  inputs: [{ name: 'r', type: 'vec4' }]
});

export const simplexNoise3d = Fn(([vInput]) => {
  const v = vec3(vInput).toVar();
  const C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const D = vec4(0.0, 0.5, 1.0, 2.0);

  const i = vec3(floor(v.add(dot(v, C.yyy)))).toVar();
  const x0 = vec3(v.sub(i).add(dot(i, C.xxx))).toVar();
  const g = vec3(step(x0.yzx, x0.xyz)).toVar();
  const l = vec3(sub(1.0, g)).toVar();
  const i1 = vec3(min(g.xyz, l.zxy)).toVar();
  const i2 = vec3(max(g.xyz, l.zxy)).toVar();
  const x1 = vec3(x0.sub(i1).add(C.xxx)).toVar();
  const x2 = vec3(x0.sub(i2).add(C.yyy)).toVar();
  const x3 = vec3(x0.sub(D.yyy)).toVar();
  i.assign(mod289(i));

  const p = vec4(
    permuteNoise(
      permuteNoise(permuteNoise(i.z.add(vec4(0.0, i1.z, i2.z, 1.0))).add(i.y).add(vec4(0.0, i1.y, i2.y, 1.0)))
        .add(i.x)
        .add(vec4(0.0, i1.x, i2.x, 1.0))
    )
  ).toVar();

  const n = float(0.142857142857).toVar();
  const ns = vec3(n.mul(D.wyz).sub(D.xzx)).toVar();
  const j = vec4(p.sub(mul(49.0, floor(p.mul(ns.z).mul(ns.z))))).toVar();
  const x_ = vec4(floor(j.mul(ns.z))).toVar();
  const y_ = vec4(floor(j.sub(mul(7.0, x_)))).toVar();
  const x = vec4(x_.mul(ns.x).add(ns.yyyy)).toVar();
  const y = vec4(y_.mul(ns.x).add(ns.yyyy)).toVar();
  const h = vec4(sub(1.0, abs(x)).sub(abs(y))).toVar();
  const b0 = vec4(x.xy, y.xy).toVar();
  const b1 = vec4(x.zw, y.zw).toVar();
  const s0 = vec4(floor(b0).mul(2.0).add(1.0)).toVar();
  const s1 = vec4(floor(b1).mul(2.0).add(1.0)).toVar();
  const sh = vec4(step(h, vec4(0.0)).negate()).toVar();
  const a0 = vec4(b0.xzyw.add(s0.xzyw.mul(sh.xxyy))).toVar();
  const a1 = vec4(b1.xzyw.add(s1.xzyw.mul(sh.zzww))).toVar();
  const p0 = vec3(a0.xy, h.x).toVar();
  const p1 = vec3(a0.zw, h.y).toVar();
  const p2 = vec3(a1.xy, h.z).toVar();
  const p3 = vec3(a1.zw, h.w).toVar();
  const norm = vec4(taylorInvSqrt4(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)))).toVar();
  p0.mulAssign(norm.x);
  p1.mulAssign(norm.y);
  p2.mulAssign(norm.z);
  p3.mulAssign(norm.w);
  const m = vec4(max(sub(0.6, vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3))), 0.0)).toVar();
  m.assign(m.mul(m));
  return mul(42.0, dot(m.mul(m), vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3))));
}).setLayout({
  name: 'simplexNoise3d',
  type: 'float',
  inputs: [{ name: 'v', type: 'vec3' }]
});

const snoiseVec3 = Fn(([x]) => {
  const v = vec3(x).toVar();
  const s = float(simplexNoise3d(vec3(v))).toVar();
  const s1 = float(simplexNoise3d(vec3(v.y.sub(19.1), v.z.add(33.4), v.x.add(47.2)))).toVar();
  const s2 = float(simplexNoise3d(vec3(v.z.add(74.2), v.x.sub(124.5), v.y.add(99.4)))).toVar();
  return vec3(s, s1, s2);
}).setLayout({
  name: 'snoiseVec3',
  type: 'vec3',
  inputs: [{ name: 'x', type: 'vec3' }]
});

export const curlNoise3d = Fn(([pInput]) => {
  const p = vec3(pInput).toVar();
  const e = float(0.1);
  const dx = vec3(e, 0.0, 0.0).toVar();
  const dy = vec3(0.0, e, 0.0).toVar();
  const dz = vec3(0.0, 0.0, e).toVar();
  const p_x0 = vec3(snoiseVec3(p.sub(dx))).toVar();
  const p_x1 = vec3(snoiseVec3(p.add(dx))).toVar();
  const p_y0 = vec3(snoiseVec3(p.sub(dy))).toVar();
  const p_y1 = vec3(snoiseVec3(p.add(dy))).toVar();
  const p_z0 = vec3(snoiseVec3(p.sub(dz))).toVar();
  const p_z1 = vec3(snoiseVec3(p.add(dz))).toVar();
  const x = float(p_y1.z.sub(p_y0.z).sub(p_z1.y).add(p_z0.y)).toVar();
  const y = float(p_z1.x.sub(p_z0.x).sub(p_x1.z).add(p_x0.z)).toVar();
  const z = float(p_x1.y.sub(p_x0.y).sub(p_y1.x).add(p_y0.x)).toVar();
  const divisor = float(div(1.0, mul(2.0, e)));
  return normalize(vec3(x, y, z).mul(divisor));
}).setLayout({
  name: 'curlNoise3d',
  type: 'vec3',
  inputs: [{ name: 'p', type: 'vec3' }]
});

export const curlNoise4d = Fn(([pInput]) => {
  const p = vec4(pInput).toVar();
  const e = float(0.1);
  const dx = vec4(e, 0.0, 0.0, 1.0).toVar();
  const dy = vec4(0.0, e, 0.0, 1.0).toVar();
  const dz = vec4(0.0, 0.0, e, 1.0).toVar();
  const p_x0 = vec3(simplexNoise3d(p.sub(dx))).toVar();
  const p_x1 = vec3(simplexNoise3d(p.add(dx))).toVar();
  const p_y0 = vec3(simplexNoise3d(p.sub(dy))).toVar();
  const p_y1 = vec3(simplexNoise3d(p.add(dy))).toVar();
  const p_z0 = vec3(simplexNoise3d(p.sub(dz))).toVar();
  const p_z1 = vec3(simplexNoise3d(p.add(dz))).toVar();
  const x = float(p_y1.z.sub(p_y0.z).sub(p_z1.y).add(p_z0.y)).toVar();
  const y = float(p_z1.x.sub(p_z0.x).sub(p_x1.z).add(p_x0.z)).toVar();
  const z = float(p_x1.y.sub(p_x0.y).sub(p_y1.x).add(p_y0.x)).toVar();
  const divisor = float(div(1.0, mul(2.0, e)));
  return normalize(vec3(x, y, z).mul(divisor));
}).setLayout({
  name: 'curlNoise4d',
  type: 'vec3',
  inputs: [{ name: 'p', type: 'vec4' }]
});

// ---------------------------------------------------------------------------
// Palette helper
// ---------------------------------------------------------------------------

export const cosinePalette = Fn(([t, a, b, c, d, period = float(2 * PI)]) => {
  return a.add(b.mul(cos(period.mul(c.mul(t).add(d)))));
}).setLayout({
  name: 'cosinePalette',
  type: 'vec3',
  inputs: [
    { name: 't', type: 'float' },
    { name: 'a', type: 'vec3' },
    { name: 'b', type: 'vec3' },
    { name: 'c', type: 'vec3' },
    { name: 'd', type: 'vec3' }
  ]
});

// ---------------------------------------------------------------------------
// Periodic simplex noise with derivatives (PSRDNoise)
// ---------------------------------------------------------------------------

export const psrdnoise3Fn = Fn(([x, period, alpha]) => {
  const M = mat3(0.0, 1.0, 1.0, 1.0, 0.0, 1.0, 1.0, 1.0, 0.0);
  const Mi = mat3(-0.5, 0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5, -0.5);
  const uvw = property('vec3');
  uvw.assign(M.mul(vec3(x)));

  const i0 = floor(uvw).toVar();
  const f0 = fract(uvw);
  const g_ = step(f0.xyx, f0.yzz);
  const l_ = sub(1.0, g_);
  const g = vec3(l_.z, g_.xy);
  const l = vec3(l_.xy, g_.z);
  const o1 = min(g, l);
  const o2 = max(g, l);

  const i1 = i0.add(o1).toVar();
  const i2 = i0.add(o2).toVar();
  const i3 = i0.add(vec3(1.0)).toVar();

  const v0 = property('vec3');
  const v1 = property('vec3');
  const v2 = property('vec3');
  const v3 = property('vec3');

  v0.assign(Mi.mul(i0));
  v1.assign(Mi.mul(i1));
  v2.assign(Mi.mul(i2));
  v3.assign(Mi.mul(i3));

  const x0 = vec3(vec3(x).sub(v0));
  const x1 = vec3(vec3(x).sub(v1));
  const x2 = vec3(vec3(x).sub(v2));
  const x3 = vec3(vec3(x).sub(v3));

  If(any(greaterThan(vec3(period), vec3(0.0))), () => {
    const vx = vec4(v0.x, v1.x, v2.x, v3.x).toVar();
    const vy = vec4(v0.y, v1.y, v2.y, v3.y).toVar();
    const vz = vec4(v0.z, v1.z, v2.z, v3.z).toVar();

    If(period.x.greaterThan(0.0), () => {
      vx.assign(mod(vx, period.x));
    });

    If(period.y.greaterThan(0.0), () => {
      vy.assign(mod(vy, period.y));
    });

    If(period.z.greaterThan(0.0), () => {
      vz.assign(mod(vz, period.z));
    });

    i0.assign(M.mul(vec3(vx.x, vy.x, vz.x)));
    i1.assign(M.mul(vec3(vx.y, vy.y, vz.y)));
    i2.assign(M.mul(vec3(vx.z, vy.z, vz.z)));
    i3.assign(M.mul(vec3(vx.w, vy.w, vz.w)));
    i0.assign(floor(i0.add(0.5)));
    i1.assign(floor(i1.add(0.5)));
    i2.assign(floor(i2.add(0.5)));
    i3.assign(floor(i3.add(0.5)));
  });

  const hashVal = permuteNoise(
    permuteNoise(permuteNoise(vec4(i0.z, i1.z, i2.z, i3.z)).add(vec4(i0.y, i1.y, i2.y, i3.y))).add(
      vec4(i0.x, i1.x, i2.x, i3.x)
    )
  );

  const theta = hashVal.mul(3.883222077);
  const sz = hashVal.mul(-0.006920415).add(0.996539792);
  const psi = hashVal.mul(0.108705628);
  const Ct = cos(theta);
  const St = sin(theta);
  const szPrime = sqrt(sub(1.0, sz.mul(sz)));

  const gx = property('vec4');
  const gy = property('vec4');
  const gz = property('vec4');

  If(alpha.notEqual(0.0), () => {
    const Sp = sin(psi);
    const Cp = cos(psi);
    const px = Ct.mul(szPrime);
    const py = St.mul(szPrime);
    const pz = sz;
    const Ctp = St.mul(Sp).sub(Ct.mul(Cp));
    const qx = mix(Ctp.mul(St), Sp, sz);
    const qy = mix(Ctp.mul(-1).mul(Ct), Cp, sz);
    const qz = py.mul(Cp).add(px.mul(Sp)).mul(-1);
    const Sa = vec4(sin(alpha));
    const Ca = vec4(cos(alpha));
    gx.assign(Ca.mul(px).add(Sa.mul(qx)));
    gy.assign(Ca.mul(py).add(Sa.mul(qy)));
    gz.assign(Ca.mul(pz).add(Sa.mul(qz)));
  }).Else(() => {
    gx.assign(Ct.mul(szPrime));
    gy.assign(St.mul(szPrime));
    gz.assign(sz);
  });

  const g0 = vec3(gx.x, gy.x, gz.x);
  const g1 = vec3(gx.y, gy.y, gz.y);
  const g2 = vec3(gx.z, gy.z, gz.z);
  const g3 = vec3(gx.w, gy.w, gz.w);

  const w = vec4(sub(0.5, vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)))).toVar();
  w.assign(max(w, 0.0));
  const w2 = w.mul(w);
  const w3 = w2.mul(w);
  const gdotx = vec4(dot(g0, x0), dot(g1, x1), dot(g2, x2), dot(g3, x3));
  const n = dot(w3, gdotx);
  const dw = float(-6.0).mul(w2).mul(gdotx);
  const dn0 = w3.x.mul(g0).add(dw.x.mul(x0));
  const dn1 = w3.y.mul(g1).add(dw.y.mul(x1));
  const dn2 = w3.z.mul(g2).add(dw.z.mul(x2));
  const dn3 = w3.w.mul(g3).add(dw.w.mul(x3));

  const result = property('vec4');
  result.xyz.assign(mul(39.5, dn0.add(dn1).add(dn2).add(dn3)));
  result.w.assign(mul(39.5, n));
  return result;
});


