#!/usr/bin/env node
// solve_ik_arm.mjs — solve shoulder/elbow/wrist angles that put a hand at a
// target position with a target palm normal and finger direction.
//
// Poses that matter dramatically (a raised palm, a hand pressing down) are much
// easier to specify as "palm HERE, facing THAT, fingers THAT way" than as seven
// Euler angles. Solve each key in turn, feeding the previous key in as `prev`,
// so the continuity term keeps the whole gesture on one branch of the solution
// space — otherwise the solver teleports between branches and the interpolated
// motion flails.
//
//   node solve_ik_arm.mjs '{
//     "chain": {"shoulder":[-18,-22,0.5], "upper":24, "fore":25, "hand":6.2},
//     "P":[-46,-12,10], "N":[0,0,1], "F":[0,1,0],
//     "prev":{"sz":-37,"sx":-38,"sy":-94,"ex":-113,"ez":0,"wx":-13,"wy":-52,"wz":30},
//     "w":0.010
//   }'
//
// Mirrors a three.js chain built as: segments along local -Y from each joint,
// Euler order ZXY on every joint, and the hand carrier flipped PI about X so
// the fingers continue along the forearm. `hand` is the palm's offset from the
// wrist. N and F must be perpendicular; the solver reports what it achieved.
const D = Math.PI / 180;
const mm = (X, Y) => { const C = []; for (let i = 0; i < 3; i++) { C[i] = []; for (let j = 0; j < 3; j++) { let s = 0; for (let k = 0; k < 3; k++) s += X[i][k] * Y[k][j]; C[i][j] = s; } } return C; };
const ap = (M, v) => [M[0][0]*v[0]+M[0][1]*v[1]+M[0][2]*v[2], M[1][0]*v[0]+M[1][1]*v[1]+M[1][2]*v[2], M[2][0]*v[0]+M[2][1]*v[1]+M[2][2]*v[2]];
const Rx = (a) => [[1,0,0],[0,Math.cos(a),-Math.sin(a)],[0,Math.sin(a),Math.cos(a)]];
const Ry = (a) => [[Math.cos(a),0,Math.sin(a)],[0,1,0],[-Math.sin(a),0,Math.cos(a)]];
const Rz = (a) => [[Math.cos(a),-Math.sin(a),0],[Math.sin(a),Math.cos(a),0],[0,0,1]];
const zxy = (x, y, z) => mm(Rz(z), mm(Rx(x), Ry(y)));
const add = (a, b) => [a[0]+b[0], a[1]+b[1], a[2]+b[2]];
const dot = (a, b) => a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const nrm = (a) => { const l = Math.hypot(...a); return [a[0]/l, a[1]/l, a[2]/l]; };

const T = JSON.parse(process.argv[2]);
const C = T.chain || { shoulder: [-18, -22, 0.5], upper: 24, fore: 25, hand: 6.2 };
function fk(p) {
  const Rs = zxy(p.sx*D, p.sy*D, p.sz*D);
  const E = add(C.shoulder, ap(Rs, [0, -C.upper, 0]));
  const Re = mm(Rs, zxy(p.ex*D, 0, (p.ez||0)*D));
  const W = add(E, ap(Re, [0, -C.fore, 0]));
  const Rw = mm(Re, zxy(p.wx*D, p.wy*D, p.wz*D));
  const Rh = mm(Rw, Rx(Math.PI));
  return { E, W, P: add(W, ap(Rh, [0, C.hand, 0])), N: ap(Rh, [0,0,1]), F: ap(Rh, [0,1,0]) };
}
const keys = ['sz','sx','sy','ex','wx','wy','wz'];   // ez stays 0: elbows do not do that
let p = { sz:-40, sx:-30, sy:-90, ex:-110, ez:0, wx:-10, wy:-50, wz:30, ...(T.prev||{}), ...(T.start||{}) };
const cost = (q) => {
  const r = fk(q); let c = 0;
  if (T.P) c += Math.hypot(r.P[0]-T.P[0], r.P[1]-T.P[1], r.P[2]-T.P[2]) / 8;
  if (T.N) c += (1 - dot(nrm(r.N), nrm(T.N))) * 9;
  if (T.F) c += (1 - dot(nrm(r.F), nrm(T.F))) * 7;
  if (T.limits) for (const [k, lo, hi] of T.limits) { if (q[k] < lo) c += (lo-q[k])*0.05; if (q[k] > hi) c += (q[k]-hi)*0.05; }
  // continuity: keep this key near the previous one so the four keys form ONE
  // continuous movement instead of jumping to another IK branch
  if (T.prev) for (const k of keys) c += Math.abs(q[k] - T.prev[k]) * (T.w ?? 0.010);
  return c;
};
let step = 24, best = cost(p);
for (let it = 0; it < 9000; it++) {
  let improved = false;
  for (const k of keys) for (const d of [step, -step]) {
    const q = { ...p }; q[k] += d;
    const c = cost(q);
    if (c < best - 1e-7) { best = c; p = q; improved = true; }
  }
  if (!improved) { step *= 0.62; if (step < 0.02) break; }
}
const r = fk(p);
console.log(JSON.stringify({
  cost: +best.toFixed(4),
  pose: Object.fromEntries(keys.map((k) => [k, +p[k].toFixed(1)])),
  palm: r.P.map((v) => +v.toFixed(1)),
  normal: nrm(r.N).map((v) => +v.toFixed(2)),
  fingers: nrm(r.F).map((v) => +v.toFixed(2)),
}));
