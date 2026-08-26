// ============ Blue Room v2 — 1:1 study of keshi's "Life with a Cat" (Seedance) ============
// Left-wall window & desk, video-matched camera, sea-blue palette, 8-scene pose carousel.
import * as THREE from 'three';
import { GRAD, vn } from './lib.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const GRAD2 = (() => {                                        // toon ramp whose bottom step is nearly black (shadows read as shadows)
  const t = new THREE.DataTexture(new Uint8Array([0, 150, 255]), 3, 1, THREE.RedFormat);
  t.minFilter = t.magFilter = THREE.NearestFilter; t.needsUpdate = true; return t;
})();
const toon = (c, o = {}) => new THREE.MeshToonMaterial({ color: c, gradientMap: GRAD2, ...o });
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const sm = (a, b, v) => { const t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const lerp = (a, b, k) => a + (b - a) * k;
const lerpAng = (a, b, k) => {
  let d = ((b - a + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI;
  return a + d * k;
};

// —— palette sampled from the video ——
const P = {
  floor: 0xf6ede2, wall: 0xfbf6f0, wallShade: 0xf1e9df, ceiling: 0xfaf6f1,
  blue: 0x4f8fdc, blueDeep: 0x1f63c2, blueLight: 0x8ec4f2, bluePale: 0xdbeafb,
  white: 0xfcf9f5, cream: 0xf6e6de, orange: 0xe26650,
  black: 0x2e2632, navy: 0x0f2c4b, hairB: 0x141a24, skin: 0xefc7b2,
  sun: 0xffedca, lav: 0x8194c6, red: 0xd15255,
};
const matWhite = toon(P.white), matBlue = toon(P.blue), matPale = toon(P.bluePale),
      matNavy = toon(P.navy), matBlack = toon(P.black), matSkin = toon(P.skin);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.38;
document.body.appendChild(renderer.domElement);
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf8efe0);

// —— camera: looking diagonally INTO the corner (left wall + right wall meet at ~55% of the frame) ——
const camera = new THREE.PerspectiveCamera(54, innerWidth / innerHeight, 0.1, 60);
const CAM = new THREE.Vector3(3.9, 1.8, 3.6);
const LOOK = new THREE.Vector3(-1.3, 1.0, -0.7);
camera.position.copy(CAM); camera.lookAt(LOOK);
// free orbit: drag to rotate, wheel to zoom, right-drag to pan — starts at the video's camera
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.copy(LOOK);
controls.enableDamping = true; controls.dampingFactor = 0.08;
controls.minDistance = 1.5; controls.maxDistance = 14;
controls.maxPolarAngle = Math.PI / 2 + 0.05;
controls.update();
// remember the user's view across reloads; C = copy camera to clipboard, R = reset
const capEl = document.getElementById('cap');
const CAP_DEFAULT = capEl ? capEl.textContent : '';
try {
  const saved = JSON.parse(localStorage.getItem('blueRoomCam') || 'null');
  if (saved) { camera.position.fromArray(saved.p); controls.target.fromArray(saved.t); controls.update(); }
} catch (e) {}
let saveTimer = 0;
controls.addEventListener('change', () => {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try { localStorage.setItem('blueRoomCam', JSON.stringify({ p: camera.position.toArray(), t: controls.target.toArray() })); } catch (e) {}
  }, 300);
});
addEventListener('keydown', (e) => {
  if (e.code === 'KeyC') {
    const r = (v) => Math.round(v * 100) / 100;
    const txt = `CAM(${r(camera.position.x)}, ${r(camera.position.y)}, ${r(camera.position.z)}) LOOK(${r(controls.target.x)}, ${r(controls.target.y)}, ${r(controls.target.z)}) fov ${camera.fov}`;
    navigator.clipboard && navigator.clipboard.writeText(txt).catch(() => {});
    if (capEl) { capEl.textContent = 'copied → ' + txt; setTimeout(() => (capEl.textContent = CAP_DEFAULT), 8000); }
  }
  if (e.code === 'KeyR') {
    try { localStorage.removeItem('blueRoomCam'); } catch (e) {}
    camera.position.copy(CAM); controls.target.copy(LOOK); controls.update();
  }
});

// —— light: sun through the left-wall window ——
scene.add(new THREE.HemisphereLight(0xfff6ea, 0xdccfbc, 1.7));
const fill = new THREE.DirectionalLight(0xffe9cf, 0.6);
fill.position.set(6, 5, 7); scene.add(fill);
const sun = new THREE.DirectionalLight(0xffc36e, 5.5);          // sunset: warm golden, low
sun.position.set(-10.5, 7, 4.7);
sun.target.position.set(-0.5, 0, 0.2);                        // ~35°, slanting from the window toward the bed head                        // ~35° sunset through the right pane: streak across the rug toward the bed foot
sun.castShadow = true;
sun.shadow.mapSize.set(3072, 3072);
Object.assign(sun.shadow.camera, { left: -16, right: 16, top: 14, bottom: -14, near: 0.5, far: 60 });
sun.shadow.bias = -0.0004;
scene.add(sun, sun.target);

// —— canvas helpers ——
function ctx2d(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d')]; }
function tex(c) { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; }
function pillowTexture() {
  const [c, g] = ctx2d(256, 256);
  g.fillStyle = '#fbf9f5'; g.fillRect(0, 0, 256, 256);
  g.fillStyle = '#4f8fdc';
  for (let i = 0; i < 26; i++) {
    const x = (i * 97) % 256, y = (i * 61 + 30) % 256, r = 8 + (i * 13) % 16;
    g.beginPath(); g.ellipse(x, y, r, r * 0.55, (i * 0.7) % 3.1, 0, Math.PI * 2); g.fill();
  }
  const t = tex(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}
function skullTexture(fg) {
  const [c, g] = ctx2d(128, 128);
  g.fillStyle = fg;
  g.beginPath(); g.arc(64, 50, 33, 0, Math.PI * 2); g.fill();
  g.fillRect(49, 68, 30, 21);
  g.globalCompositeOperation = 'destination-out';
  g.beginPath(); g.arc(51, 48, 9, 0, Math.PI * 2); g.arc(77, 48, 9, 0, Math.PI * 2); g.fill();
  g.fillRect(60, 60, 8, 9);
  for (let i = 0; i < 3; i++) g.fillRect(53 + i * 10, 76, 4, 12);
  return tex(c);
}
function posterBig() {
  const [c, g] = ctx2d(256, 380);
  g.fillStyle = '#f4f8fd'; g.fillRect(0, 0, 256, 380);
  g.fillStyle = '#1557b8';
  g.font = '900 330px Helvetica'; g.fillText('8', -20, 300);
  g.fillRect(16, 320, 150, 16); g.fillRect(16, 346, 90, 9);
  return tex(c);
}
function posterC() {
  const [c, g] = ctx2d(256, 380);
  g.fillStyle = '#1557b8'; g.fillRect(0, 0, 256, 380);
  g.fillStyle = '#f4f8fd';
  g.font = '900 300px Helvetica'; g.fillText('C', 30, 270);
  g.fillRect(20, 310, 180, 12);
  return tex(c);
}
function posterMt() {
  const [c, g] = ctx2d(200, 260);
  g.fillStyle = '#eaf2fb'; g.fillRect(0, 0, 200, 260);
  g.fillStyle = '#2c6cc4';
  g.beginPath(); g.moveTo(0, 190); g.lineTo(70, 60); g.lineTo(120, 140); g.lineTo(160, 90); g.lineTo(200, 190); g.closePath(); g.fill();
  g.fillStyle = '#fff'; g.beginPath(); g.moveTo(70, 60); g.lineTo(88, 95); g.lineTo(52, 95); g.closePath(); g.fill();
  g.fillStyle = '#2c6cc4'; g.fillRect(18, 214, 164, 8); g.fillRect(18, 230, 100, 6);
  return tex(c);
}
function rugTexture() {
  const [c, g] = ctx2d(512, 512);
  g.fillStyle = '#fcfaf5'; g.beginPath(); g.arc(256, 256, 254, 0, Math.PI * 2); g.fill();  // shaggy white border
  g.fillStyle = '#4a8bd9'; g.beginPath(); g.arc(256, 256, 208, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#fcfaf5';
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * Math.PI * 2;
    g.beginPath(); g.arc(256 + Math.cos(a) * 176, 256 + Math.sin(a) * 176, 17, 0, Math.PI * 2); g.fill();
  }
  g.fillStyle = 'rgba(255,255,255,0.9)';
  [[210, 250, 40], [310, 300, 30]].forEach(([x, y, r]) => { g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); });
  return tex(c);
}
function screenTexture() {
  const [c, g] = ctx2d(256, 160);
  g.fillStyle = '#eaf3fd'; g.fillRect(0, 0, 256, 160);
  g.fillStyle = '#bcd7f2';
  for (let y = 18; y < 160; y += 16) g.fillRect(0, y, 256, 1);
  for (let x = 34; x < 256; x += 40) g.fillRect(x, 0, 1, 160);
  g.fillStyle = '#2c6cc4'; g.fillRect(0, 0, 256, 15);
  g.fillStyle = '#7fb3e8'; g.fillRect(34, 34, 40, 16); g.fillRect(114, 66, 40, 16);
  return tex(c);
}
function skyTexture() {
  const [c, g] = ctx2d(64, 64);
  const gr = g.createLinearGradient(0, 0, 0, 64);
  gr.addColorStop(0, '#5f9be0'); gr.addColorStop(1, '#c9dff2');
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
  return tex(c);
}
function beamTexture() {
  const [c, g] = ctx2d(64, 128);
  const gr = g.createLinearGradient(0, 0, 0, 128);
  gr.addColorStop(0, 'rgba(255,240,210,0.9)');
  gr.addColorStop(1, 'rgba(255,240,210,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 64, 128);
  return tex(c);
}

// —— room shell: LEFT wall at x=-3 (window/desk), RIGHT wall at z=-3 (door/bed), corner at (-3,-3) ——
function box(w, h, d, mat, x, y, z, parent = scene) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true;
  parent.add(m); return m;
}
function soft(geo) { const g = mergeVertices(geo); g.computeVertexNormals(); return g; }
function puff(geo, amp, freq, seed = 0) {
  const p = geo.attributes.position, n = geo.attributes.normal;
  for (let i = 0; i < p.count; i++) {
    const ny = n.getY(i); if (ny < -0.2) continue;
    const x = p.getX(i), z = p.getZ(i);
    const d = (vn(x * freq + seed, z * freq + seed * 1.7) - 0.5) * 2 * amp
            + (vn(x * freq * 2.3 + 9 + seed, z * freq * 2.3 + 4) - 0.5) * amp * 0.6;
    p.setXYZ(i, x + n.getX(i) * d, p.getY(i) + ny * d, z + n.getZ(i) * d);
  }
  geo.computeVertexNormals(); return geo;
}
const fabric = (color) => new THREE.MeshPhysicalMaterial({ color, roughness: 0.95, metalness: 0, sheen: 1.0, sheenRoughness: 0.6, sheenColor: new THREE.Color(0xffffff) });
// draped duvet: a fine cloth sheet over the mattress — rolling hills on top, rolls over the edges and hangs down the sides
function duvetGeometry(w, l, thick, top, ox, oz, seed = 5) {
  const geo = new THREE.PlaneGeometry(w + 2 * ox, l + oz, 80, 70);
  geo.rotateX(-Math.PI / 2);
  const p = geo.attributes.position, R = 0.17;
  for (let i = 0; i < p.count; i++) {
    let x = p.getX(i), z = p.getZ(i) + oz / 2;                       // head edge at z=-l/2, foot overhang at +z
    const dx = Math.abs(x) - w / 2, dz = z - l / 2;
    const d = (dx > 0 && dz > 0) ? Math.hypot(dx, dz) : Math.max(dx, dz);
    let y;
    if (d <= 0) {
      const edge = Math.min(1, -d / 0.3);                                   // hills fade toward the edges
      const hills = (vn(x * 1.7 + seed, z * 1.7) - 0.5) * 0.5 + (vn(x * 4 + 9, z * 4 + seed) - 0.5) * 0.1;
      y = top + thick + hills * (0.4 + 0.6 * edge);
    } else if (d < R) {                                                      // roll over the mattress edge
      const a = (d / R) * Math.PI / 2;
      y = top + thick * Math.cos(a) - 0.02;
    } else {                                                                 // short soft overhang down the side
      y = top - 0.02 - (d - R) * 0.9;
      const pull = (d - R) * 0.85;
      const sx = Math.max(0, dx), sz = Math.max(0, dz), sum = sx + sz || 1;
      x -= Math.sign(x) * Math.min(pull * sx / sum, Math.max(0, dx - R * 0.3));
      z -= Math.min(pull * sz / sum, Math.max(0, dz - R * 0.3));
    }
    p.setXYZ(i, x, y, z - oz / 2);
  }
  geo.computeVertexNormals();
  return geo;
}
function softMesh(geo, mat, x, y, z, ry = 0) {
  const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.rotation.y = ry;
  m.castShadow = true; m.receiveShadow = true; scene.add(m); return m;
}
const LW = -3.0, RW = -3.0;
const WZ0 = -0.95, WZ1 = 2.15, WY0 = 1.05, WY1 = 3.05;   // window opening on the left wall
{
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), toon(P.floor));
  floor.rotation.x = -Math.PI / 2; floor.position.set(1, 0, 1); floor.receiveShadow = true; scene.add(floor);
  const wallMat = toon(P.wallShade);
  const seg = (h, d, y, z) => box(0.12, h, d, wallMat, LW - 0.06, y, z);
  seg(3.4, WZ0 + 6, 1.7, (WZ0 - 6) / 2);                        // left of the window
  seg(3.4, 8 - WZ1, 1.7, (WZ1 + 8) / 2);                        // right of the window
  seg(WY0, WZ1 - WZ0, WY0 / 2, (WZ0 + WZ1) / 2);                // below the window
  seg(3.4 - WY1, WZ1 - WZ0, (3.4 + WY1) / 2, (WZ0 + WZ1) / 2);  // above the window
  const right = box(12, 3.4, 0.12, toon(P.wall), 2, 1.7, RW - 0.06);
  right.castShadow = false;
  // room ceiling: bright interior white (unlit so it never reads as 'outside'), spans the room
  const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(9, 9), new THREE.MeshBasicMaterial({ color: 0xfbf8f3 }));
  ceiling.rotation.x = Math.PI / 2; ceiling.position.set(LW + 4.5, 3.4, RW + 4.5); ceiling.castShadow = true; scene.add(ceiling);
  const ceilSlab = box(9.2, 0.2, 9.2, new THREE.MeshBasicMaterial({ color: 0xfbf8f3 }), LW + 4.5, 3.5, RW + 4.5); ceilSlab.receiveShadow = false;  // solid roof over the room only — never outside the window
  const cornice = new THREE.Mesh(new THREE.PlaneGeometry(9, 9), new THREE.MeshBasicMaterial({ color: 0xf3eee7 }));
  cornice.rotation.x = Math.PI / 2; cornice.position.set(LW + 4.5, 3.401, RW + 4.5); cornice.visible = false; scene.add(cornice);
  const sky = new THREE.Mesh(new THREE.PlaneGeometry(14, 8), new THREE.MeshBasicMaterial({ map: skyTexture() }));
  sky.rotation.y = Math.PI / 2; sky.position.set(LW - 2.5, 3.0, 0.6); scene.add(sky);   // the outdoors
}
// window frame + mullions — they cast the thin bars inside the real light patch
{
  const F = matWhite;
  box(0.1, 0.1, 3.25, F, LW + 0.02, WY1, 0.6); box(0.1, 0.1, 3.25, F, LW + 0.02, WY0, 0.6);
  box(0.1, 2.1, 0.1, F, LW + 0.02, 2.05, WZ0); box(0.1, 2.1, 0.1, F, LW + 0.02, 2.05, WZ1);
  box(0.06, 2.0, 0.05, F, LW + 0.02, 2.05, 0.6);
  box(0.2, 0.2, 3.35, matWhite, LW + 0.1, 3.2, 0.6);            // roller blind box
}
// desk: along the LEFT wall; monitor near the corner
{
  box(0.6, 0.06, 4.75, matWhite, LW + 0.3, 0.73, -0.22);
  box(0.55, 0.72, 0.07, matWhite, LW + 0.3, 0.36, -2.55);
  box(0.55, 0.72, 0.07, matWhite, LW + 0.3, 0.36, 2.12);
  const mon = new THREE.Group(); mon.position.set(LW + 0.3, 0.76, -2.0); mon.rotation.y = Math.PI / 2 - 0.08; scene.add(mon);
  box(0.86, 0.54, 0.045, matWhite, 0, 0.5, 0, mon);
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.78, 0.46), new THREE.MeshBasicMaterial({ map: screenTexture() }));
  scr.position.set(0, 0.5, 0.026); mon.add(scr);
  box(0.09, 0.2, 0.09, matWhite, 0, 0.12, 0, mon);
  box(0.32, 0.025, 0.12, matWhite, 0, 0.03, 0.24, mon);
  // white PC tower with blue rings, left of the monitor
  const pc = box(0.22, 0.42, 0.42, matWhite, LW + 0.3, 0.97, -1.25);
  for (let i = 0; i < 2; i++) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.012, 6, 20), matBlue);
    ring.rotation.y = Math.PI / 2; ring.position.set(0.115, 0.08 - i * 0.16, 0); pc.add(ring);
  }
  // pens / papers / microscope toward the near end
  const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.045, 0.13, 10), matPale);
  cup.position.set(LW + 0.3, 0.83, 0.4); cup.castShadow = true; scene.add(cup);
  for (let i = 0; i < 5; i++) {
    const pen = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.007, 0.16, 6), i % 2 ? matBlue : matNavy);
    pen.position.set(LW + 0.3 + Math.sin(i) * 0.02, 0.94, 0.4 + (i - 2) * 0.018);
    pen.rotation.x = (i - 2) * 0.1; scene.add(pen);
  }
  box(0.22, 0.02, 0.3, matPale, LW + 0.32, 0.77, -0.5);
  const cup2 = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.04, 0.12, 10), matWhite);
  cup2.position.set(LW + 0.22, 0.82, 0.62); cup2.castShadow = true; scene.add(cup2);
  for (let i = 0; i < 4; i++) {
    const pen = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.15, 6), i % 2 ? matBlue : matWhite);
    pen.position.set(LW + 0.22 + Math.cos(i) * 0.015, 0.92, 0.62 + Math.sin(i * 2) * 0.015); pen.rotation.z = (i - 1.5) * 0.08; scene.add(pen);
  }
  box(0.08, 0.08, 0.08, toon(P.orange), LW + 0.35, 0.8, 0.9);
  for (let i = 0; i < 3; i++) box(0.3, 0.025, 0.22, toon(i === 1 ? P.blueLight : P.blue), LW + 0.3, 0.775 + i * 0.027, 1.7);
  box(0.12, 0.1, 0.12, matWhite, LW + 0.25, 0.81, 0.1);
  const mic = new THREE.Group(); mic.position.set(LW + 0.3, 0.76, 1.3); scene.add(mic);
  box(0.09, 0.03, 0.12, matNavy, 0, 0.015, 0, mic);
  const arm = box(0.03, 0.16, 0.03, matNavy, 0, 0.1, 0.02, mic); arm.rotation.x = 0.35;
  const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.022, 0.1, 8), matNavy);
  tube.position.set(0, 0.15, -0.02); tube.rotation.x = -0.5; mic.add(tube);
  // drawers + red-label file boxes under the near end of the desk
  box(0.5, 0.66, 1.35, matWhite, LW + 0.3, 0.33, 1.42);
  for (let c = 0; c < 3; c++) for (let r = 0; r < 3; r++) {
    box(0.03, 0.17, 0.4, toon(P.lav), LW + 0.56, 0.13 + r * 0.21, 0.98 + c * 0.44);
    const kn = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.03, 0.1), matWhite);
    kn.position.set(LW + 0.58, 0.13 + r * 0.21, 0.98 + c * 0.44); scene.add(kn);
  }
  // clutter to the right of the cabinet: boxes, orange folders, a tin
  box(0.26, 0.22, 0.3, matWhite, LW + 0.32, 0.87, 0.45);
  box(0.24, 0.12, 0.26, matPale, LW + 0.32, 1.04, 0.45);
  for (let i = 0; i < 3; i++) box(0.28, 0.03, 0.22, toon(i === 1 ? P.blue : P.orange), LW + 0.3, 0.775 + i * 0.033, 0.1);
  const tin = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.16, 12), matNavy);
  tin.position.set(LW + 0.42, 0.84, -0.2); tin.castShadow = true; scene.add(tin);
  for (let i = 0; i < 2; i++) {
    box(0.26, 0.36, 0.28, matWhite, LW + 0.32, 0.18, 0.55 - i * 0.32);
    const lab = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.14), new THREE.MeshBasicMaterial({ color: 0xd94f3f }));
    lab.rotation.y = Math.PI / 2; lab.position.set(LW + 0.46, 0.2, 0.55 - i * 0.32); scene.add(lab);
  }
  // white-blue bear plushie sitting by the drawers
  {
    const bx = LW + 0.95, bz = 0.9, bm = fabric(0xfcfaf6);
    const body = new THREE.Mesh(soft(new THREE.SphereGeometry(0.14, 16, 12)), bm);
    body.scale.set(1, 0.85, 0.9); body.position.set(bx, 0.12, bz); body.castShadow = true; scene.add(body);
    const head = new THREE.Mesh(soft(new THREE.SphereGeometry(0.12, 16, 12)), bm);
    head.position.set(bx, 0.32, bz + 0.01); head.castShadow = true; scene.add(head);
    for (const sx of [-1, 1]) {
      const ear = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 8), bm);
      ear.position.set(bx + sx * 0.09, 0.42, bz - 0.02); scene.add(ear);
      const arm = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 8), bm);
      arm.scale.set(1, 0.8, 1.6); arm.position.set(bx + sx * 0.14, 0.14, bz + 0.05); scene.add(arm);
    }
    const face = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 10), toon(P.blue));
    face.scale.set(1.1, 0.8, 0.5); face.position.set(bx + 0.06, 0.31, bz + 0.1); face.rotation.y = Math.PI / 4; scene.add(face);
  }
}
// small two-tier bookcase ON the desk under the left pane of the window (half the window's height), books lying on top
{
  const BZ0 = 0.75, BZ1 = 2.1, BC = (BZ0 + BZ1) / 2, BW = BZ1 - BZ0, Y0 = 0.76, H = 0.95;
  box(0.03, H, BW, matWhite, LW + 0.04, Y0 + H / 2, BC);
  box(0.32, H, 0.03, matWhite, LW + 0.19, Y0 + H / 2, BZ0);
  box(0.32, H, 0.03, matWhite, LW + 0.19, Y0 + H / 2, BZ1);
  for (const y of [0.02, 0.48]) box(0.32, 0.03, BW, matWhite, LW + 0.19, Y0 + y, BC);
  box(0.32, 0.03, BW, matWhite, LW + 0.19, Y0 + H - 0.015, BC);
  const N = 54;
  const books = new THREE.InstancedMesh(new THREE.BoxGeometry(0.22, 0.3, 0.045), new THREE.MeshToonMaterial({ gradientMap: GRAD2 }), N);
  books.castShadow = true;
  const cols = [0x4f8fdc, 0x8ec4f2, 0x1f63c2, 0xfcf9f5, 0x6fa3dd, 0xfcf9f5, 0xdbeafb, 0x0f2c4b, 0xe26650].map((c) => new THREE.Color(c));
  const d = new THREE.Object3D();
  for (let i = 0; i < N; i++) {
    const row = Math.floor(i / 22), k = i % 22;
    if (row > 1) { d.position.set(0, -50, 0); d.scale.set(0.001, 0.001, 0.001); }   // (unused slots hidden)
    else {
      const h = 0.7 + ((i * 37) % 10) / 26;
      d.position.set(LW + 0.19, Y0 + [0.04, 0.5][row] + 0.15 * h, BZ0 + 0.06 + k * 0.058);
      d.rotation.set(Math.sin(i * 13) * 0.04, 0, 0); d.scale.set(1, h, 1);
    }
    d.updateMatrix(); books.setMatrixAt(i, d.matrix);
    books.setColorAt(i, cols[(i * 5 + row) % cols.length]);
  }
  scene.add(books);
  const flatCols = [0x4f8fdc, 0xfcf9f5, 0x1f63c2, 0xe26650, 0x8ec4f2, 0xfcf9f5];
  flatCols.forEach((c, i) => box(0.24, 0.045, 0.3, toon(c), LW + 0.19, Y0 + H + 0.03 + (i % 3) * 0.047, BZ0 + 0.35 + Math.floor(i / 3) * 0.45).rotation.y = (i % 2) * 0.12);   // books lying flat on top
  for (let i = 0; i < 4; i++) box(0.26, 0.03, 0.2, toon(i % 2 ? P.blue : P.blueLight), LW + 0.45, 0.02 + i * 0.032, 2.45);
  box(0.24, 0.2, 0.22, matWhite, LW + 0.45, 0.1, 2.8);
}
// RIGHT wall: door right of the corner, stickers, arc lamp
{
  box(1.0, 2.2, 0.06, matWhite, -1.95, 1.1, RW + 0.03);
  box(1.08, 2.26, 0.03, toon(P.wallShade), -1.95, 1.13, RW + 0.01);
  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.032, 10, 10), matNavy);
  knob.position.set(-1.57, 1.05, RW + 0.08); scene.add(knob);
  box(0.78, 0.02, 0.02, toon(P.wallShade), -1.95, 1.62, RW + 0.07);
  box(0.78, 0.02, 0.02, toon(P.wallShade), -1.95, 0.62, RW + 0.07);
  box(0.02, 0.98, 0.02, toon(P.wallShade), -2.34, 1.12, RW + 0.07);
  box(0.02, 0.98, 0.02, toon(P.wallShade), -1.56, 1.12, RW + 0.07);
  const stick = (x, y, z, ry, w, h, c) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: c }));
    m.position.set(x, y, z); m.rotation.y = ry; scene.add(m);
  };
  // left wall, above the desk near the corner
  stick(LW + 0.01, 2.25, -1.7, Math.PI / 2, 0.2, 0.26, 0x3e83d6);
  stick(LW + 0.01, 1.95, -2.1, Math.PI / 2, 0.15, 0.15, 0x7fb3e8);
  stick(LW + 0.01, 2.5, -1.3, Math.PI / 2, 0.17, 0.2, 0xd9ebfb);
  stick(LW + 0.01, 1.85, -1.15, Math.PI / 2, 0.13, 0.16, 0x3e83d6);
  // right wall, between door and bed
  stick(2.1, 2.1, RW + 0.01, 0, 0.2, 0.2, 0x7fb3e8);
  stick(2.45, 2.5, RW + 0.01, 0, 0.16, 0.2, 0x3e83d6);
  // arc floor lamp beside the door, arc bending left over the door
  const g = new THREE.Group(); g.position.set(-1.38, 0, RW + 0.28); scene.add(g);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.19, 0.045, 14), matWhite);
  base.position.y = 0.022; base.castShadow = true; g.add(base);
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 2.35, 8), matWhite);
  pole.position.y = 1.18; g.add(pole);
  const arc = new THREE.Mesh(new THREE.TorusGeometry(0.52, 0.018, 8, 28, Math.PI), matWhite);
  arc.position.set(0.52, 2.35, 0); g.add(arc);
  const drop = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.14, 6), matWhite);
  drop.position.set(1.04, 2.28, 0); g.add(drop);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.2, 18, 14), toon(P.white, { emissive: 0xfff2d8, emissiveIntensity: 0.4 }));
  head.scale.y = 0.92; head.position.set(1.04, 2.1, 0); head.castShadow = true; g.add(head);
}
// bed: HEAD against the right wall, beside the door — puffy fabric bedding
const BED_TOP = 0.6;
{
  const BX = -0.35, BZ = RW + 1.2;                                  // bed centre — right beside the door
  box(1.95, 0.24, 2.35, matWhite, BX, 0.14, BZ);                    // platform
  box(0.02, 0.1, 2.1, matPale, BX - 0.98, 0.12, BZ);                // drawer seam
  softMesh(soft(new RoundedBoxGeometry(1.88, 0.22, 2.3, 4, 0.05)), fabric(0xf4f1fb), BX, 0.37, BZ);         // mattress
  { const dm = fabric(P.blue); dm.side = THREE.DoubleSide;
    softMesh(duvetGeometry(1.94, 1.78, 0.2, 0.5, 0.22, 0.2), dm, BX, 0, BZ + 0.3); }   // thick comforter with a soft overhang
  softMesh(soft(new RoundedBoxGeometry(1.85, 0.1, 0.7, 6, 0.05)), fabric(P.bluePale), BX, 0.52, RW + 0.6);   // pale sheet at the head
  const pillow = (x, z, ry, col, seed) => {
    const g = puff(soft(new RoundedBoxGeometry(0.72, 0.5, 0.28, 12, 0.12)), 0.03, 4, seed);
    const p = g.attributes.position, n = g.attributes.normal;
    for (let i = 0; i < p.count; i++) if (n.getY(i) > 0.5) {
      const px = p.getX(i), pz = p.getZ(i);
      p.setY(i, p.getY(i) - 0.04 * Math.exp(-((px / 0.25) ** 2 + (pz / 0.12) ** 2)));   // soft dent
    }
    g.computeVertexNormals();
    const mat = fabric(col); mat.map = pillowTexture(); mat.color.set(0xffffff);
    const m = softMesh(g, mat, x, 0.86, z, ry); m.rotation.x = -0.45; return m;   // leaning back
  };
  pillow(BX - 0.45, RW + 0.3, 0.1, 0xfcf9f5, 11);
  pillow(BX + 0.42, RW + 0.32, -0.08, 0xeef3fb, 17);
  softMesh(soft(new RoundedBoxGeometry(2.0, 0.9, 0.12, 4, 0.05)), fabric(0xfbf9f5), BX, 0.6, RW + 0.08);  // padded headboard
  // posters above the bed head
  const poster = (map, w, h, x, y) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map })); m.position.set(x, y, RW + 0.02); scene.add(m); };
  poster(posterMt(), 0.9, 1.0, -0.88, 2.9);        // 2x2 directly above the bed head
  poster(posterC(), 0.9, 1.0, 0.18, 2.9);
  poster(posterBig(), 0.9, 1.0, -0.88, 1.85);
  poster(posterC(), 0.9, 1.0, 0.18, 1.85);
  // nightstand beside the bed head, toy car on top; books stacked on the floor in front of it
  box(0.6, 0.62, 0.5, matWhite, 1.0, 0.31, RW + 0.3);
  box(0.52, 0.02, 0.44, matPale, 1.0, 0.63, RW + 0.3);
  box(0.16, 0.06, 0.08, matBlue, 1.0, 0.67, RW + 0.3);
  const bc = [0xd94f3f, 0x3e83d6, 0xfbf9f5, 0x26324e, 0x7fb3e8];
  bc.forEach((c, i) => {
    const b = box(0.4, 0.05, 0.3, toon(c), 1.0, 0.028 + i * 0.054, RW + 0.95);
    b.rotation.y = Math.sin(i * 9) * 0.22;
  });
  const mouse = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 8), matWhite);
  mouse.scale.set(1.3, 0.8, 1); mouse.position.set(1.3, 0.05, RW + 1.6); mouse.castShadow = true; scene.add(mouse);
  box(0.5, 1.1, 0.45, matWhite, 3.4, 0.55, RW + 0.4);             // tall white unit at the far right
}
// rug (front-left), soft poufs, floor pillow at the bed foot
const RUG = new THREE.Vector2(-1.2, 1.6);
{
  const rug = new THREE.Mesh(new THREE.CircleGeometry(1.6, 48), new THREE.MeshToonMaterial({ map: rugTexture(), gradientMap: GRAD2 }));
  rug.rotation.x = -Math.PI / 2; rug.rotation.z = Math.PI / 4; rug.scale.x = 1.3; rug.position.set(RUG.x, 0.012, RUG.y); rug.receiveShadow = true; scene.add(rug);

  softMesh(puff(soft(new RoundedBoxGeometry(0.62, 0.34, 0.62, 10, 0.16)), 0.02, 4, 21), fabric(P.blue), 0.9, 0.17, 0.6, 0.4);   // pouf
  softMesh(puff(soft(new RoundedBoxGeometry(0.62, 0.2, 0.5, 10, 0.09)), 0.025, 4, 23), fabric(P.blue), -0.45, 0.1, -0.3, 0.5);  // floor pillow
}
// white shell desk chair at the desk, by the window
const chairPos = new THREE.Vector3(-2.15, 0, 0.35);
{
  const ch = new THREE.Group(); ch.position.copy(chairPos); ch.rotation.y = -Math.PI / 2 + 0.35; scene.add(ch);
  const seat = new THREE.Mesh(soft(new RoundedBoxGeometry(0.54, 0.1, 0.5, 6, 0.05)), matWhite);
  seat.position.set(0, 0.46, 0); seat.castShadow = true; ch.add(seat);
  const back = new THREE.Mesh(new THREE.SphereGeometry(0.32, 20, 14, Math.PI * 0.75, Math.PI * 0.5, 0.2, 1.1), matWhite);
  back.scale.set(1, 1.35, 0.9); back.position.set(0, 0.55, 0.06); back.rotation.y = Math.PI; ch.add(back);
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.032, 0.4, 10), matWhite);
  pole.position.y = 0.24; ch.add(pole);
  for (let i = 0; i < 5; i++) {
    const leg = box(0.045, 0.035, 0.28, matWhite, 0, 0.03, 0, ch);
    leg.rotation.y = (i / 5) * Math.PI * 2;
    leg.translateZ(0.15);
  }
}
// ============ characters: full pose rig ============
// —— tapered ribbon-loft hair locks (img2threejs recipe): width/thickness taper along a centreline ——
const HAIR_W = [1.0, 0.95, 0.8, 0.55, 0.3, 0.04], HAIR_T = [1.0, 0.9, 0.75, 0.5, 0.3, 0.08];
const prof = (arr, t) => { const x = t * (arr.length - 1), i = Math.floor(x), f = x - i; return i >= arr.length - 1 ? arr[arr.length - 1] : arr[i] * (1 - f) + arr[i + 1] * f; };
function ribbonLock(pts, width, thick, mat, parent) {
  const curve = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)));
  const N = 14, pos = [], idx = [];
  let prevB = null;
  const ref = new THREE.Vector3(), B = new THREE.Vector3(), Nn = new THREE.Vector3();
  for (let i = 0; i <= N; i++) {
    const t = i / N, p = curve.getPoint(t), T = curve.getTangent(t).normalize();
    ref.set(p.x, 0, p.z); if (ref.lengthSq() < 1e-4) ref.set(1, 0, 0); ref.normalize();
    B.crossVectors(T, ref).normalize(); if (prevB && B.dot(prevB) < 0) B.negate(); prevB = B.clone();
    Nn.crossVectors(B, T).normalize();
    const w = width * prof(HAIR_W, t), d = thick * prof(HAIR_T, t);
    const corners = [[-1, 1], [1, 1], [1, -1], [-1, -1]];
    for (const [sb, sn] of corners) {
      pos.push(p.x + B.x * sb * w / 2 + Nn.x * sn * d / 2, p.y + B.y * sb * w / 2 + Nn.y * sn * d / 2, p.z + B.z * sb * w / 2 + Nn.z * sn * d / 2);
    }
    if (i > 0) { const a = (i - 1) * 4, b = i * 4; for (let k = 0; k < 4; k++) { const k2 = (k + 1) % 4; idx.push(a + k, b + k, b + k2, a + k, b + k2, a + k2); } }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx); g.computeVertexNormals();
  const m = new THREE.Mesh(g, mat); m.castShadow = true; parent.add(m); return m;
}
function buildGirl({ hoodie, skull, hair, longHair, skirt, sleeveMarks }) {
  const root = new THREE.Group(); root.rotation.order = 'YZX'; scene.add(root);   // pitch (lie down) -> roll (side/prone) -> yaw (heading)
  const R = { root };
  const mh = toon(hoodie), mhair = toon(hair);
  const hips = new THREE.Group(); root.add(hips); R.hips = hips;
  // long slim legs
  R.legs = {};
  for (const sd of [-1, 1]) {
    const th = new THREE.Group(); th.position.set(sd * 0.075, 0, 0); hips.add(th);
    const thigh = new THREE.Mesh(new THREE.CapsuleGeometry(0.052, 0.24, 4, 10), matSkin);
    thigh.position.y = -0.16; thigh.castShadow = true; th.add(thigh);
    const kn = new THREE.Group(); kn.position.y = -0.31; th.add(kn);
    const calf = new THREE.Mesh(new THREE.CapsuleGeometry(0.042, 0.28, 4, 10), matSkin);
    calf.position.y = -0.17; calf.castShadow = true; kn.add(calf);
    const foot = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 8), matSkin);
    foot.scale.set(1, 0.6, 1.7); foot.position.set(0, -0.33, 0.035); kn.add(foot);
    R.legs[sd < 0 ? 'L' : 'R'] = { th, kn };
  }
  if (skirt) {
    const sk = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.3, 0.22, 24), matBlack);
    sk.position.y = -0.05; hips.add(sk);
    const hem = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.012, 6, 24), toon(0x1c1a22));
    hem.rotation.x = Math.PI / 2; hem.position.y = -0.16; hips.add(hem);
  } else {
    const sh = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.2, 0.16, 12), matBlack);
    sh.position.y = -0.03; hips.add(sh);
  }
  // oversized hoodie
  const torso = new THREE.Group(); torso.position.y = 0.05; hips.add(torso); R.torso = torso;
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.235, 0.3, 6, 14), mh);
  body.position.y = 0.25; body.scale.set(1, 1, 0.85); body.castShadow = true; torso.add(body);
  const decal = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.3),
    new THREE.MeshBasicMaterial({ map: skullTexture(skull), transparent: true }));
  decal.position.set(0, 0.24, 0.205); torso.add(decal);
  const hood = new THREE.Mesh(new THREE.SphereGeometry(0.15, 12, 10), mh);
  hood.scale.set(1.1, 0.6, 0.8); hood.position.set(0, 0.5, -0.16); torso.add(hood);
  // head (anime proportion) + face
  const headP = new THREE.Group(); headP.position.y = 0.55; torso.add(headP); R.head = headP;
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.05, 0.08, 8), matSkin);
  neck.position.y = 0.02; headP.add(neck);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.165, 20, 16), matSkin);
  head.scale.set(1, 1.05, 0.98); head.position.y = 0.16; head.castShadow = true; headP.add(head);
  for (const sx of [-0.06, 0.06]) {
    const sclera = new THREE.Mesh(new THREE.SphereGeometry(0.03, 12, 12), matWhite);
    sclera.scale.set(1, 1.4, 0.35); sclera.position.set(sx, 0.135, 0.148); headP.add(sclera);
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.02, 12, 12), toon(0x2a4f8f));
    eye.scale.set(1, 1.5, 0.45); eye.position.set(sx, 0.132, 0.158); headP.add(eye);
    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.01, 8, 8), toon(0x0f1a33));
    pupil.scale.set(1, 1.5, 0.5); pupil.position.set(sx, 0.13, 0.166); headP.add(pupil);
    const glint = new THREE.Mesh(new THREE.SphereGeometry(0.006, 6, 6), matWhite);
    glint.position.set(sx - 0.007, 0.146, 0.172); headP.add(glint);
  }
  const mouth = new THREE.Mesh(new THREE.SphereGeometry(0.008, 6, 6), toon(0xd98a8a));
  mouth.scale.set(1.6, 0.6, 0.5); mouth.position.set(0, 0.085, 0.162); headP.add(mouth);
  // hair: lathe-turned "bell" helmet, wider than the head all the way down, face wedge cut out
  const mhair2 = toon(hair, { side: THREE.DoubleSide });
  const lathe = (profile, phiStart, phiLen) => {
    const pts = profile.slice().reverse().map(([r, y]) => new THREE.Vector2(r, y));   // bottom -> top so normals face outward
    const g = new THREE.LatheGeometry(pts, 40, phiStart, phiLen);
    const m = new THREE.Mesh(g, mhair2); m.castShadow = true; headP.add(m); return m;
  };
  // fringe: front wedge only, from the crown to a straight cut at the brow
  lathe([[0.02, 0.365], [0.12, 0.35], [0.185, 0.3], [0.2, 0.24], [0.198, 0.2], [0.17, 0.195]], -Math.PI * 0.36, Math.PI * 0.72);
  if (longHair) {
    // long hair: crown -> flared curtain down to the shoulder blades, open at the front
    lathe([[0.02, 0.365], [0.13, 0.35], [0.195, 0.29], [0.21, 0.18], [0.21, 0.02], [0.215, -0.15], [0.225, -0.32], [0.2, -0.36], [0.12, -0.35]], Math.PI * 0.34, Math.PI * 1.32);
    for (const sx of [-1, 1]) {                                                       // slim front locks framing the face
      const side = new THREE.Mesh(new THREE.CapsuleGeometry(0.04, 0.34, 6, 10), mhair);
      side.position.set(sx * 0.19, -0.02, 0.06); headP.add(side);
    }
  } else {
    // bob: crown -> straight sides -> slight inward curl at the chin
    lathe([[0.02, 0.365], [0.13, 0.35], [0.195, 0.29], [0.21, 0.18], [0.21, 0.08], [0.2, 0.02], [0.16, 0.0], [0.13, 0.01]], Math.PI * 0.34, Math.PI * 1.32);
  }
  // baggy sleeves
  R.arms = {};
  for (const sd of [-1, 1]) {
    const sh = new THREE.Group(); sh.position.set(sd * 0.22, 0.4, 0); torso.add(sh);
    const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.068, 0.28, 4, 10), mh);
    arm.position.y = -0.17; arm.castShadow = true; sh.add(arm);
    if (sleeveMarks) for (let i = 0; i < 3; i++) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.008, 6, 14), matWhite);
      ring.rotation.x = Math.PI / 2; ring.position.y = -0.1 - i * 0.08; sh.add(ring);
    }
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.04, 10, 8), matSkin);
    hand.position.y = -0.37; sh.add(hand);
    R.arms[sd < 0 ? 'L' : 'R'] = sh;
  }
  const phone = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.14, 0.013), matNavy);
  phone.position.set(0, 0.24, 0.27); phone.rotation.x = -0.6; phone.visible = false; torso.add(phone);
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(0.075, 0.12), new THREE.MeshBasicMaterial({ color: 0xdff0ff }));
  glow.position.z = -0.008; glow.rotation.y = Math.PI; phone.add(glow);
  R.phone = phone;
  return R;
}
const G1 = buildGirl({ hoodie: P.black, skull: '#ffffff', hair: P.navy, longHair: true, skirt: true, sleeveMarks: true });
const G2 = buildGirl({ hoodie: P.cream, skull: '#ef8352', hair: P.hairB, longHair: false, skirt: false });

// pose params: defaults = standing
const DEF = { x: 0, z: 0, ry: 0, rx: 0, rz: 0, hipsY: 0.67, torsoX: 0, headX: 0, headY: 0,
  aLx: 0, aLz: 0.25, aRx: 0, aRz: -0.25, tL: 0, cL: 0, tR: 0, cR: 0, phone: 0, via: null };
const pose = (o) => ({ ...DEF, ...o });
const TO_CAM = 1.0;                   // facing the camera from the rug
// —— G1 (black hoodie, navy long hair, skirt) ——
const PA = [
  pose({ x: chairPos.x, z: chairPos.z, ry: -Math.PI / 2 + 0.2, hipsY: 0.56, tL: -1.5, cL: 1.2, tR: -1.5, cR: 1.2, aLx: -0.9, aLz: 0.2, aRx: -0.9, aRz: -0.2, headX: 0.1 }), // 1 desk chair
  pose({ x: -0.2, z: 2.3, ry: 2.84, rx: -Math.PI / 2, rz: Math.PI / 2, hipsY: 0.24, tL: -0.6, cL: 0.9, tR: -0.4, cR: 0.6, aLx: -0.9, aLz: 0.3, aRx: -0.5, aRz: -0.6, headX: 0.1 }),   // 2 on her right side on the rug, face toward the camera
  pose({ x: -1.5, z: 1.3, ry: TO_CAM, aLz: 2.75, aRz: -2.75, headX: -0.25 }),                                          // 3 stretch on the rug
  pose({ x: -1.1, z: 1.5, ry: TO_CAM - 1.1, hipsY: 0.3, tL: -0.25, cL: 2.5, tR: -0.25, cR: 2.5, aLz: 0.35, aRx: -0.5, aRz: -1.4 }), // 4 kneel, play with cat
  pose({ x: 0.9, z: 0.6, ry: TO_CAM, hipsY: 0.67 + 0.36, aLz: 0.8, aRz: -0.8 }),                                     // 5 on the pouf
  pose({ x: 0.2, z: 0.3, ry: -0.9 }),                                                                                  // 6 standing, watching G2
  pose({ x: -1.4, z: 1.5, ry: TO_CAM, hipsY: 0.26, tL: -1.2, cL: 1.0, tR: -0.8, cR: 1.6, aRx: -0.4, aRz: -2.6, headX: -0.3 }), // 7 sitting on rug, arm up
  pose({ x: chairPos.x, z: chairPos.z, ry: -Math.PI / 2 + 1.2, hipsY: 0.54, torsoX: -0.45, tL: -1.1, cL: 0.4, tR: -1.3, cR: 0.5, aLz: 0.9, aRz: -0.4, headX: -0.15 }), // 8 lounging on the chair
];
// —— G2 (cream hoodie, bob, shorts) ——
const PB = [
  pose({ x: -1.0, z: 1.8, ry: TO_CAM + 0.2, rx: -Math.PI / 2, hipsY: 0.17, aRx: -1.5, aRz: -0.2, tL: -0.9, cL: 1.3 }), // 1 lying on the rug, arm up
  pose({ x: 0.72, z: -1.3, ry: 0.6, hipsY: 0.86, via: [1.25, -0.2], tL: -1.35, cL: 1.3, tR: -1.35, cR: 1.3, aLx: -1.1, aLz: 0.25, aRx: -1.1, aRz: -0.25, headX: 0.45, phone: 1 }), // 2 bed edge, phone
  pose({ x: 0.3, z: -0.1, ry: TO_CAM + Math.PI, aLz: 2.8, aRz: -2.8, headX: -0.2 }),                                   // 3 stretch, back to camera
  pose({ x: -0.35, z: -1.7, ry: 0, rx: -Math.PI / 2, hipsY: 1.02, via: [1.25, -0.2], aLz: 0.6, aRx: -1.2 }),          // 4 lying on the bed
  pose({ x: -0.35, z: -1.65, ry: 0, rx: -Math.PI / 2, rz: Math.PI, hipsY: 1.04, via: [1.25, -0.2], tL: 0.1, cL: 1.9, tR: 0.1, cR: 1.6, headX: -0.5 }), // 5 on tummy, kicking
  pose({ x: -2.05, z: 1.7, ry: -Math.PI / 2 - 0.5, hipsY: 0.3, tL: -2.2, cL: 2.4, tR: -2.2, cR: 2.4, torsoX: 0.35, aLx: -0.7, aRx: -0.7, headX: 0.3 }), // 6 crouch by the drawers w/ cat
  pose({ x: 1.5, z: 1.5, ry: TO_CAM + Math.PI }),                                                                      // 7 standing in the foreground
  pose({ x: 1.0, z: -1.05, ry: 0.6, hipsY: 0.24, via: [1.25, -0.2], tL: -1.9, cL: 2.1, tR: -1.7, cR: 2.0, aLx: -1.0, aRx: -1.0, headX: 0.5, phone: 1, torsoX: 0.1 }), // 8 floor, back to bed, phone
];
// —— cat ——
const PC = [
  { x: -2.0, z: 2.2, ry: 0.4, sit: 1, y: 0 },
  { x: 0.0, z: 1.3, ry: 1.8, sit: 0, y: 0 },
  { x: -2.1, z: 2.1, ry: 0.9, sit: 1, y: 0 },
  { x: -1.85, z: 1.85, ry: 0.5, sit: 0, y: 0 },
  { x: 1.0, z: 0.7, ry: -0.2, sit: 1, y: 0 },
  { x: -1.7, z: 1.5, ry: -1.6, sit: 1, y: 0 },
  { x: 1.7, z: 2.0, ry: 2.0, sit: 0, y: 0 },
  { x: -0.1, z: -1.3, ry: 2.4, sit: 0, y: 0.92, via: [1.25, -0.2] },
];

// —— cat rig (tuxedo): rounded body, white blaze/bib/paws, pink ears, whiskers, 3-joint tail ——
const cat = (() => {
  const root = new THREE.Group(); scene.add(root);
  const black = toon(0x1d1a22), white = toon(0xfcfaf6), pink = toon(0xf4b3aa);
  const R = { root };
  const body = new THREE.Group(); root.add(body); R.body = body;
  const trunk = new THREE.Mesh(soft(new RoundedBoxGeometry(0.2, 0.36, 0.2, 6, 0.09)), black);
  trunk.position.y = 0.15; trunk.castShadow = true; body.add(trunk);
  const bib = new THREE.Mesh(new THREE.SphereGeometry(0.085, 14, 12), white);
  bib.scale.set(0.95, 1.25, 0.8); bib.position.set(0, 0.11, 0.075); body.add(bib);
  const haunch = new THREE.Mesh(new THREE.SphereGeometry(0.11, 14, 12), black);
  haunch.scale.set(1.15, 0.8, 1.15); haunch.position.set(0, 0.03, -0.02); body.add(haunch); R.haunch = haunch;
  // head
  const headP = new THREE.Group(); headP.position.set(0, 0.33, 0.05); body.add(headP); R.head = headP;
  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.085, 18, 14), black);
  skull.scale.set(1.1, 0.95, 0.95); skull.castShadow = true; headP.add(skull);
  const blaze = new THREE.Mesh(new THREE.SphereGeometry(0.06, 14, 12), white);      // white muzzle + blaze up the nose
  blaze.scale.set(1.25, 1.05, 0.9); blaze.position.set(0, -0.02, 0.05); headP.add(blaze);
  const blaze2 = new THREE.Mesh(new THREE.SphereGeometry(0.028, 10, 8), white);
  blaze2.scale.set(0.8, 1.6, 0.6); blaze2.position.set(0, 0.035, 0.078); headP.add(blaze2);
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.011, 8, 6), pink);
  nose.position.set(0, 0.0, 0.106); headP.add(nose);
  const mouth = new THREE.Mesh(new THREE.SphereGeometry(0.004, 6, 6), toon(0x6b4a4a));
  mouth.scale.set(3, 0.6, 1); mouth.position.set(0, -0.016, 0.105); headP.add(mouth);
  for (const sx of [-1, 1]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.014, 10, 10), toon(0x76c26a));
    eye.scale.set(1, 1.3, 0.6); eye.position.set(sx * 0.04, 0.024, 0.07); headP.add(eye);
    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.005, 6, 6), black);
    pupil.scale.set(0.6, 1.6, 0.5); pupil.position.set(sx * 0.04, 0.024, 0.081); headP.add(pupil);
    const ear = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.06, 4), black);
    ear.position.set(sx * 0.052, 0.088, -0.005); ear.rotation.z = -sx * 0.3; headP.add(ear);
    const inner = new THREE.Mesh(new THREE.ConeGeometry(0.015, 0.034, 4), pink);
    inner.position.set(sx * 0.05, 0.083, 0.006); inner.rotation.z = -sx * 0.3; headP.add(inner);
    for (let w = 0; w < 3; w++) {                                                     // whiskers
      const wh = new THREE.Mesh(new THREE.CylinderGeometry(0.0012, 0.0012, 0.09, 4), white);
      wh.position.set(sx * 0.075, -0.005 - w * 0.008, 0.08); wh.rotation.z = sx * (1.35 + w * 0.15); wh.rotation.y = sx * 0.4; headP.add(wh);
    }
  }
  // legs with white 'gloves'
  R.legsF = []; R.legsB = [];
  for (const sx of [-1, 1]) {
    const lf = new THREE.Group(); lf.position.set(sx * 0.05, 0.1, 0.085); body.add(lf);
    const m1 = new THREE.Mesh(new THREE.CapsuleGeometry(0.02, 0.1, 4, 8), black);
    m1.position.y = -0.06; m1.castShadow = true; lf.add(m1);
    const paw = new THREE.Mesh(new THREE.SphereGeometry(0.024, 8, 8), white);
    paw.scale.set(1, 0.7, 1.2); paw.position.set(0, -0.135, 0.008); lf.add(paw);
    R.legsF.push(lf);
    const lb = new THREE.Group(); lb.position.set(sx * 0.055, 0.08, -0.06); body.add(lb);
    const m2 = new THREE.Mesh(new THREE.CapsuleGeometry(0.022, 0.07, 4, 8), black);
    m2.position.y = -0.045; lb.add(m2);
    const paw2 = new THREE.Mesh(new THREE.SphereGeometry(0.024, 8, 8), white);
    paw2.scale.set(1, 0.7, 1.2); paw2.position.set(0, -0.1, 0.008); lb.add(paw2);
    R.legsB.push(lb);
  }
  // tail (black, white tip)
  const t1 = new THREE.Group(); t1.position.set(0, 0.06, -0.11); body.add(t1);
  const s1 = new THREE.Mesh(new THREE.CapsuleGeometry(0.021, 0.11, 4, 8), black); s1.position.y = 0.065; t1.add(s1);
  const t2 = new THREE.Group(); t2.position.y = 0.13; t1.add(t2);
  const s2 = new THREE.Mesh(new THREE.CapsuleGeometry(0.018, 0.09, 4, 8), black); s2.position.y = 0.055; t2.add(s2);
  const t3 = new THREE.Group(); t3.position.y = 0.11; t2.add(t3);
  const s3 = new THREE.Mesh(new THREE.CapsuleGeometry(0.015, 0.07, 4, 8), white); s3.position.y = 0.045; t3.add(s3);
  Object.assign(R, { t1, t2, t3 });
  root.scale.setScalar(1.4);
  return R;
})();

// ============ scene sequencer ============
const SCENE_LEN = 4.5, NS = 8, TRANS = 1.0;
function applyGirl(R, prev, cur, k, t, kick) {
  const p = {};
  for (const key of Object.keys(DEF)) {
    p[key] = key === 'ry' ? lerpAng(prev[key], cur[key], k) : lerp(prev[key], cur[key], k);
  }
  const moving = Math.hypot(cur.x - prev.x, cur.z - prev.z) > 0.3 && k > 0 && k < 1;
  const via = cur.via || prev.via;
  if (moving && via) {                                                     // detour around the bed foot
    if (k < 0.5) { const u = k * 2; p.x = lerp(prev.x, via[0], u); p.z = lerp(prev.z, via[1], u); }
    else { const u = (k - 0.5) * 2; p.x = lerp(via[0], cur.x, u); p.z = lerp(via[1], cur.z, u); }
    p.hipsY = DEF.hipsY;
  }
  R.root.position.set(p.x, p.hipsY + (moving ? Math.abs(Math.sin(t * 9)) * 0.05 : 0), p.z);
  R.root.rotation.set(moving ? 0 : p.rx, p.ry, moving ? 0 : p.rz);         // stand up while walking
  R.torso.rotation.x = p.torsoX;
  R.head.rotation.x = p.headX; R.head.rotation.y = p.headY;
  R.arms.L.rotation.x = p.aLx; R.arms.L.rotation.z = p.aLz;
  R.arms.R.rotation.x = p.aRx; R.arms.R.rotation.z = p.aRz;
  const walkSwing = moving ? Math.sin(t * 9) * 0.5 : 0;
  R.legs.L.th.rotation.x = (moving ? walkSwing : p.tL);
  R.legs.L.kn.rotation.x = (moving ? Math.max(0, -walkSwing) : p.cL) + (kick ? Math.sin(t * 5) * 0.35 : 0);
  R.legs.R.th.rotation.x = (moving ? -walkSwing : p.tR);
  R.legs.R.kn.rotation.x = (moving ? Math.max(0, walkSwing) : p.cR) + (kick ? Math.sin(t * 5 + Math.PI) * 0.35 : 0);
  R.phone.visible = p.phone > 0.5;
  R.torso.scale.y = 1 + Math.sin(t * 1.1 + p.x) * 0.012;                    // breathing
}
if (new URLSearchParams(location.search).get('diag') === 'sun') {   // dev: direct sun only
  setTimeout(() => {
    const tp = new THREE.Vector3(); sun.target.getWorldPosition(tp);
    const lp = new THREE.Vector3(); sun.getWorldPosition(lp);
    console.log('SUNDIAG light', lp.toArray().map((v) => v.toFixed(2)).join(','), 'target', tp.toArray().map((v) => v.toFixed(2)).join(','), 'parent', sun.parent && sun.parent.type, sun.target.parent && sun.target.parent.type);
  }, 800);
  scene.traverse((o) => { if (o.isHemisphereLight) o.intensity = 0; });
  fill.intensity = 0;
}
const DIAG_POSE = new URLSearchParams(location.search).get('diag') === 'pose';
// —— cinematic entry: establishing shot -> desk detail -> bed detail -> settle into the initial view ——
const QP = new URLSearchParams(location.search);
const INTRO_ON = QP.has('intro') || !(QP.has('view') || QP.has('diag'));
let introT = parseFloat(QP.get('it') || '0') || 0, introDone = !INTRO_ON;
const introEndPos = camera.position.clone(), introEndLook = controls.target.clone();
const SHOTS = [
  { d: 4.2, from: [5.6, 3.15, 5.4], to: [4.6, 2.7, 4.4], look: [-0.9, 0.9, -0.9] },     // overview from the high inside corner, slow dolly in
  { d: 2.6, from: [-0.5, 1.55, 3.5], to: [0.1, 1.65, 3.0], look: [-2.7, 1.15, 1.3] },   // desk corner
  { d: 2.6, from: [2.5, 1.95, 1.2], to: [1.9, 1.75, 0.5], look: [-0.2, 0.9, -2.0] },    // bed
  { d: 2.8 },                                                                            // settle into the initial camera
];
const _ip = new THREE.Vector3(), _il = new THREE.Vector3(), _ia = new THREE.Vector3(), _ib = new THREE.Vector3();
function updateIntro(dt) {
  introT += dt;
  let acc = 0;
  for (let i = 0; i < SHOTS.length; i++) {
    const sh = SHOTS[i];
    if (introT < acc + sh.d) {
      const u = (introT - acc) / sh.d, e = u * u * (3 - 2 * u);
      if (sh.from) {
        _ia.fromArray(sh.from); _ib.fromArray(sh.to); _ip.copy(_ia).lerp(_ib, u);      // linear dolly inside a shot
        _il.fromArray(sh.look);
      } else {                                                                          // settle: previous shot end -> initial view
        _ia.fromArray(SHOTS[2].to); _ib.fromArray(SHOTS[2].look);
        _ip.copy(_ia).lerp(introEndPos, e); _il.copy(_ib).lerp(introEndLook, e);
      }
      camera.position.copy(_ip); camera.lookAt(_il);
      return;
    }
    acc += sh.d;
  }
  introDone = true;
  camera.position.copy(introEndPos); controls.target.copy(introEndLook); controls.enabled = true; controls.update();
}
if (!introDone) {
  controls.enabled = false;
  const skip = () => { if (!introDone) { introT = 1e6; } };
  addEventListener('pointerdown', skip, { once: true }); addEventListener('keydown', skip, { once: true });
}
const clock = new THREE.Clock();
const T0 = parseFloat(new URLSearchParams(location.search).get('t') || '0') || 0; // ?t=12 jumps the carousel
renderer.setAnimationLoop(() => {
  const dt = Math.min(clock.getDelta(), 0.05);
  const t = clock.getElapsedTime() + T0;
  const st = t % (SCENE_LEN * NS);
  const si = Math.floor(st / SCENE_LEN);
  const k = sm(0, TRANS, st - si * SCENE_LEN);
  const pi = (si + NS - 1) % NS;
  applyGirl(G1, PA[pi], PA[si], k, t, false);
  applyGirl(G2, PB[pi], PB[si], k, t, si === 4);   // tummy scene: kicking feet
  if (DIAG_POSE && t > 1.2 && !window.__pl) { window.__pl = 1; console.log('POSEDIAG si', si, 'k', k.toFixed(2), 'G2 thL', G2.legs.L.th.rotation.x.toFixed(2), 'knL', G2.legs.L.kn.rotation.x.toFixed(2), 'armR', G2.arms.R.rotation.x.toFixed(2), 'root', G2.root.rotation.x.toFixed(2), G2.root.rotation.y.toFixed(2), G2.root.rotation.z.toFixed(2), 'y', G2.root.position.y.toFixed(2)); const bb = new THREE.Box3().setFromObject(G2.root); console.log('G2BBOX', bb.min.toArray().map((v) => v.toFixed(2)).join(','), '->', bb.max.toArray().map((v) => v.toFixed(2)).join(','), 'visible', G2.root.visible, 'torsoScale', G2.torso.scale.y.toFixed(2)); }
  // per-scene overlays
  if (si === 3) { G1.arms.R.rotation.z += Math.sin(t * 3) * 0.25; }         // waving at the cat
  if (si === 4) { G1.root.position.y += Math.abs(Math.sin(t * 3.2)) * 0.06; } // bouncing on the pouf
  if (si === 2) { G1.torso.rotation.z = Math.sin(t * 1.4) * 0.08; G2.torso.rotation.z = Math.sin(t * 1.4 + 1) * 0.08; }
  else { G1.torso.rotation.z = 0; G2.torso.rotation.z = 0; }
  if (si === 5) { G2.arms.R.rotation.x = -0.7 + Math.sin(t * 2.6) * 0.3; }  // petting
  // cat
  const cp = PC[pi], cc = PC[si];
  let cx = lerp(cp.x, cc.x, k), cz = lerp(cp.z, cc.z, k), cy = lerp(cp.y, cc.y, k);
  const cvia = cc.via || cp.via;
  if (cvia && k > 0 && k < 1) {
    if (k < 0.5) { const u = k * 2; cx = lerp(cp.x, cvia[0], u); cz = lerp(cp.z, cvia[1], u); cy = lerp(cp.y, 0, u); }
    else { const u = (k - 0.5) * 2; cx = lerp(cvia[0], cc.x, u); cz = lerp(cvia[1], cc.z, u); cy = lerp(0, cc.y, u); }
  }
  const walking = k > 0 && k < 1 && Math.hypot(cc.x - cp.x, cc.z - cp.z) > 0.3;
  cat.root.position.set(cx, cy + (walking ? Math.abs(Math.sin(t * 10)) * 0.02 : 0), cz);
  cat.root.rotation.y = walking ? Math.atan2(cc.x - cp.x, cc.z - cp.z) : lerpAng(cp.ry, cc.ry, k);
  const sit = walking ? 0 : lerp(cp.sit, cc.sit, k);
  cat.body.rotation.x = lerp(1.25, 0.3, sit);                 // horizontal <-> upright
  cat.body.position.y = lerp(0.09, 0, sit);
  cat.haunch.scale.setScalar(lerp(0.7, 1.1, sit));
  cat.head.rotation.x = lerp(-1.0, -0.15, sit);
  for (const l of cat.legsF) l.rotation.x = lerp(-1.25, -0.3, sit) + (walking ? Math.sin(t * 10) * 0.5 : 0);
  for (const l of cat.legsB) l.rotation.x = lerp(-1.25, -0.2, sit) + (walking ? Math.sin(t * 10 + Math.PI) * 0.5 : 0);
  cat.t1.rotation.x = -0.5 + Math.sin(t * 1.4) * 0.3;
  cat.t2.rotation.x = Math.sin(t * 1.4 + 0.7) * 0.5;
  cat.t3.rotation.x = Math.sin(t * 1.4 + 1.4) * 0.65;
  if (introDone) controls.update(); else updateIntro(dt);
  renderer.render(scene, camera);
});
addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

// dev: ?view=g1|g2|cat puts the camera in front of a character for close-up checks (after frame 5)
const VIEW = new URLSearchParams(location.search).get('view');
let viewFrames = 0;
if (VIEW) {
  const apply = () => {
    const Q = new URLSearchParams(location.search);
    if (VIEW === 'free' && Q.get('cam') && Q.get('look')) {
      camera.position.fromArray(Q.get('cam').split(',').map(Number)); controls.target.fromArray(Q.get('look').split(',').map(Number)); controls.update(); return;
    }
    if (VIEW === 'rug') { camera.position.set(1.6, 2.4, 3.6); controls.target.set(-1.2, 0, 1.4); controls.update(); return; }
    if (VIEW === 'desk') { camera.position.set(-0.2, 1.7, 3.6); controls.target.set(-2.8, 1.1, 2.4); controls.update(); return; }
    if (VIEW === 'bed') { camera.position.set(2.2, 1.9, 0.9); controls.target.set(0.2, 0.9, -2.2); controls.update(); return; }
    const tgt = VIEW === 'g1' ? G1.root : VIEW === 'g2' ? G2.root : cat.root;
    const p = tgt.position, ry = tgt.rotation.y, d = VIEW === 'cat' ? 1.1 : 2.0;
    camera.position.set(p.x + Math.sin(ry) * d + 0.5, p.y + (VIEW === 'cat' ? 0.5 : 0.95), p.z + Math.cos(ry) * d + 0.3);
    controls.target.set(p.x, p.y + (VIEW === 'cat' ? 0.2 : 0.55), p.z); controls.update();
  };
  const tick = () => { if (++viewFrames === 6) apply(); else requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
}
