// ============ 常量 / 数学 / 地形 / 共享材质 ============
import * as THREE from 'three';

export const SPIRAL = { turns: 3.5, R0: 128, R1: 10, theta0: Math.PI / 2 };
export const MOUNTAIN_R = 150, MOUNTAIN_H = 58;
export const PATH_HALF = 5.0, SUMMIT_R = 14;
export const N_GATES = 24;
export const WORLD_CLAMP = 170;

export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const smoothstep = (a, b, v) => { const t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };

// ---- 山体轮廓：中心高 58，半径 150 处归零 ----
export function mountainH(r) {
  const u = clamp(r / MOUNTAIN_R, 0, 1);
  const s = 1 - u * u * (3 - 2 * u);
  return MOUNTAIN_H * Math.pow(s, 1.35);
}
export function hash2(x, z) { const s = Math.sin(x * 127.1 + z * 311.7) * 43758.5453; return s - Math.floor(s); }
function vnoise(x, z) {
  const xi = Math.floor(x), zi = Math.floor(z), xf = x - xi, zf = z - zi;
  const u = xf * xf * (3 - 2 * xf), w = zf * zf * (3 - 2 * zf);
  return lerp(lerp(hash2(xi, zi), hash2(xi + 1, zi), u), lerp(hash2(xi, zi + 1), hash2(xi + 1, zi + 1), u), w);
}
export const vn = vnoise;
export const noise = (x, z) =>
  (vnoise(x * 0.045, z * 0.045) - 0.5) * 3.2 + (vnoise(x * 0.13 + 7.3, z * 0.13 + 2.9) - 0.5) * 1.1;

// ---- 盘山螺旋参道 ----
export function spiralPoint(t) {
  const th = SPIRAL.theta0 + t * SPIRAL.turns * Math.PI * 2;
  const r = lerp(SPIRAL.R0, SPIRAL.R1, t);
  return new THREE.Vector3(Math.cos(th) * r, 0, Math.sin(th) * r);
}
export function spiralTangent(t) {
  const a = spiralPoint(Math.max(0, t - 0.001)), b = spiralPoint(Math.min(1, t + 0.001));
  return b.sub(a).normalize();
}
// 任意点到螺旋参道的（径向）距离与参数 t
export function pathInfo(x, z) {
  const r = Math.hypot(x, z), phi = Math.atan2(z, x);
  const TH = SPIRAL.turns * Math.PI * 2;
  let bd = Infinity, bt = 0;
  for (let k = 0; k <= 5; k++) {
    const t = (phi + k * Math.PI * 2 - SPIRAL.theta0) / TH;
    if (t < 0 || t > 1) continue;
    const d = Math.abs(r - lerp(SPIRAL.R0, SPIRAL.R1, t));
    if (d < bd) { bd = d; bt = t; }
  }
  return { d: bd, t: bt };
}
export const summitY = mountainH(SPIRAL.R1);
// 最终地形：山体 + 噪声，参道与山顶平台处被“压平”
export function sampleTerrain(x, z) {
  const r = Math.hypot(x, z);
  let h = mountainH(r);
  const p = pathInfo(x, z);
  const pm = 1 - smoothstep(PATH_HALF * 0.45, PATH_HALF, p.d);
  h = lerp(h, mountainH(lerp(SPIRAL.R0, SPIRAL.R1, p.t)), pm);
  let mask = pm;
  const sm = 1 - smoothstep(SUMMIT_R * 0.6, SUMMIT_R, r);
  h = lerp(h, summitY, sm);
  mask = Math.max(mask, sm);
  return { h: h + noise(x, z) * (1 - mask), mask };
}
export const groundY = (x, z) => sampleTerrain(x, z).h;

// ---- 卡通渲染：3 阶 gradientMap ----
export function makeGradientMap() {
  const data = new Uint8Array([96, 168, 255]);
  const tex = new THREE.DataTexture(data, 3, 1, THREE.RedFormat);
  tex.minFilter = tex.magFilter = THREE.NearestFilter;
  tex.needsUpdate = true;
  return tex;
}
export const GRAD = makeGradientMap();
const toon = (color, extra = {}) => new THREE.MeshToonMaterial({ color, gradientMap: GRAD, ...extra });
export const MAT = {
  vermilion: toon(0xd7401f),
  black: toon(0x2b2126),
  gold: toon(0xf0b429, { emissive: 0x8a5200, emissiveIntensity: 0.35 }),
  goldGhost: toon(0xffd77a, { emissive: 0xcc8a22, emissiveIntensity: 0.7, transparent: true, opacity: 0, depthWrite: false }),
  trunk: toon(0x5d4034),
  stone: toon(0xbab2a8),
  stoneDark: toon(0x8d857c),
  lantern: toon(0xffe9b0, { emissive: 0xffc45e, emissiveIntensity: 1.4 }),
  blossom: toon(0xffffff),
};
export function radialTex(inner, outer, size = 64) {
  const c = document.createElement('canvas'); c.width = c.height = size;
  const g = c.getContext('2d');
  const gr = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gr.addColorStop(0, inner); gr.addColorStop(1, outer);
  g.fillStyle = gr; g.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(c);
}
export function petalTexture(size = 48, deep = false) {
  const c = document.createElement('canvas'); c.width = c.height = size;
  const g = c.getContext('2d');
  const u = size / 48;
  g.translate(size / 2, size / 2 + 3 * u); g.rotate(0.5);
  // 樱花瓣：顶端带缺口的泪滴形
  const grad = g.createLinearGradient(0, 14 * u, 0, -14 * u);
  grad.addColorStop(0, deep ? '#ff9ec9' : '#ffc9de');
  grad.addColorStop(1, deep ? '#ffd5e6' : '#fff3f8');
  g.fillStyle = grad;
  g.shadowColor = 'rgba(255,180,210,0.9)'; g.shadowBlur = 4 * u;
  g.beginPath();
  g.moveTo(0, 14 * u);
  g.bezierCurveTo(11 * u, 8 * u, 11 * u, -8 * u, 4 * u, -12 * u);
  g.lineTo(0, -8 * u);          // 顶端缺口
  g.lineTo(-4 * u, -12 * u);
  g.bezierCurveTo(-11 * u, -8 * u, -11 * u, 8 * u, 0, 14 * u);
  g.fill();
  return new THREE.CanvasTexture(c);
}
