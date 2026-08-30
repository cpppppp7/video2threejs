#!/usr/bin/env node
// solve_camera.mjs — solve a camera from measurements taken off a reference frame.
//
// Give it two landmarks whose world positions you know, the NDC position each
// one occupies in the frame, and (for at least one) its apparent size. It grid-
// searches camera position, heading and fov, refining four times, and prints a
// CAM / LOOK / fov you can paste into a shot.
//
//   node solve_camera.mjs '{
//     "aspect": 2.34,
//     "A": {"p":[0,0,0],      "r":11, "ndc":[0.45,0.15], "sizeNdc":0.72},
//     "B": {"p":[-46,-12,10], "r":15, "ndc":[-0.47,-0.22], "sizeNdc":0.66},
//     "range": {"fov":[26,56,2], "d":[36,150,3], "az":[-175,175,5], "el":[-50,50,4]}
//   }'
//
// ndc: x right, y up, ±1 at the frame edge.
// sizeNdc: the body's on-screen RADIUS as a fraction of the frame's HALF-height.
//   Measure a radius in pixels, divide by (frameHeightPx / 2). For a width
//   measurement multiply by the aspect ratio first.
//
// The camera is aimed so that A lands exactly on its NDC; B's NDC and both
// sizes are what the search minimises. Constrain `el` when the solution family
// is ambiguous — it usually is, and the wrong branch puts the camera above a
// subject the reference clearly looks up at.
const S = JSON.parse(process.argv[2]);
const A = S.aspect ?? 1972 / 842;
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const len = (a) => Math.sqrt(dot(a, a));
const nrm = (a) => { const l = len(a); return [a[0] / l, a[1] / l, a[2] / l]; };
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const mul = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
const basis = (f) => { const r = nrm(cross(f, [0, 1, 0])); return [r, cross(r, f)]; };

function proj(cam, f, P, fov) {
  const ty = Math.tan(fov * Math.PI / 360), tx = ty * A, [r, u] = basis(f);
  const d = sub(P, cam), z = dot(d, f);
  if (z <= 0) return null;
  return [dot(d, r) / z / tx, dot(d, u) / z / ty];
}
// rotate the view direction until `P` lands on (nx, ny)
function aim(cam, P, nx, ny, fov) {
  const ty = Math.tan(fov * Math.PI / 360), tx = ty * A, dn = nrm(sub(P, cam));
  let f = dn.slice();
  for (let i = 0; i < 60; i++) {
    const [r, u] = basis(f);
    const want = nrm(add(add(f, mul(r, nx * tx)), mul(u, ny * ty)));
    const v = cross(want, dn), c = dot(want, dn);
    if (len(v) < 1e-12) break;
    const k = 1 / (1 + c);
    const rot = (x) => add(add(x, cross(v, x)), mul(cross(v, cross(v, x)), k));
    f = nrm(rot(f));
  }
  return f;
}

let R = S.range || { fov: [26, 60, 2], d: [30, 190, 4], az: [-175, 175, 5], el: [-70, 40, 4] };
let best = null;
function search(R) {
  let b = null;
  for (let fov = R.fov[0]; fov <= R.fov[1]; fov += R.fov[2])
  for (let d = R.d[0]; d <= R.d[1]; d += R.d[2])
  for (let az = R.az[0]; az <= R.az[1]; az += R.az[2])
  for (let el = R.el[0]; el <= R.el[1]; el += R.el[2]) {
    const a = az * Math.PI / 180, e = el * Math.PI / 180;
    const cam = [S.A.p[0] + d * Math.cos(e) * Math.sin(a),
                 S.A.p[1] + d * Math.sin(e),
                 S.A.p[2] + d * Math.cos(e) * Math.cos(a)];
    const f = aim(cam, S.A.p, S.A.ndc[0], S.A.ndc[1], fov);
    const q = proj(cam, f, S.B.p, fov);
    if (!q) continue;
    const ty = Math.tan(fov * Math.PI / 360);
    let err = Math.hypot(q[0] - S.B.ndc[0], q[1] - S.B.ndc[1]);
    if (S.A.sizeNdc) err += Math.abs((S.A.r / d) / ty - S.A.sizeNdc) * 2;
    if (S.B.sizeNdc) {
      const dB = len(sub(S.B.p, cam));
      err += Math.abs((S.B.r / dB) / ty - S.B.sizeNdc) * 2;
    }
    if (!b || err < b.err) b = {
      err: +err.toFixed(4), fov: +fov.toFixed(2), d: +d.toFixed(2), az, el,
      cam: cam.map((v) => +v.toFixed(2)),
      look: add(cam, mul(f, d)).map((v) => +v.toFixed(2)),
      Bndc: q.map((v) => +v.toFixed(3)),
    };
  }
  return b;
}
for (let pass = 0; pass < 4; pass++) {
  best = search(R);
  if (!best) { console.error('no solution in range'); process.exit(1); }
  const z = (k, st) => [best[k] - st * 2, best[k] + st * 2, st / 2.5];
  R = { fov: z('fov', R.fov[2]), d: z('d', R.d[2]), az: z('az', R.az[2]), el: z('el', R.el[2]) };
}
console.log(JSON.stringify(best, null, 1));
console.log(`cam ${best.cam}  look ${best.look}  fov ${best.fov}`);
