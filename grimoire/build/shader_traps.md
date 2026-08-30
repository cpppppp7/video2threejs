# Shader and noise traps that fail silently

The dangerous ones do not throw. They render *something*, so you tune the wrong
knob for an hour. Install the error hook first, then read this list whenever a
procedural surface looks flat, washed, or absent.

## Wire up the shader error log before anything else

```js
renderer.debug.onShaderError = (gl, prog, vs, fs) => {
  errEl.textContent = 'SHADER\n' + (gl.getShaderInfoLog(fs) || '') + (gl.getShaderInfoLog(vs) || '');
};
```

A custom `ShaderMaterial` that fails to compile renders **nothing at all** and
logs only to the console. With this hook the message lands on the page and the
next screenshot names the bug. It found `'modelMatrix' : undeclared identifier`
in one render after ~40 minutes of guessing at geometry and depth.

## `modelMatrix` is injected into the vertex shader only

There is no `modelMatrix` in the fragment stage. To use an object's world centre
per-fragment, pass it as a varying:

```glsl
// vertex
varying vec3 vC;
vC = (modelMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
```

## GLSL undefined behaviour that yields NaN

Both of these are **undefined**, and NaN then propagates through additive
blending so the whole shell vanishes:

```glsl
pow(x, 2.0)              // undefined for x < 0  -> use  float t = x; t*t;
smoothstep(hi, lo, x)    // undefined when edge0 > edge1
                         // -> 1.0 - smoothstep(lo, hi, x)
```

## A biased hash flattens every texture in the scene

```js
// WRONG: the products overflow to double before the bit ops.
// Mean 0.26, never above 0.42 — fbm built on it has almost no range.
let h = x * 374761393 + y * 668265263 + z * 2147483647;
h = (h ^ (h >> 13)) * 1274126177;
return ((h ^ (h >> 16)) >>> 0) / 4294967295;

// right: stay in 32-bit the whole way
function hash3(x, y, z) {
  let h = Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263) ^ Math.imul(z | 0, 1013904223);
  h = Math.imul(h ^ (h >>> 15), 2246822519);
  h = Math.imul(h ^ (h >>> 13), 3266489917);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967295;
}
```

Symptoms: a planet with no continents, clouds that smear into one grey sheet,
nebulae that are flat blobs. Test the generator before trusting it — print
min/mean/max over a few thousand samples and expect ≈ 0/0.5/1.

Related: even with a good hash, fbm clusters tightly around 0.5. Stretch it
before thresholding, or a threshold produces a few specks instead of continents:
`const cont = (fbm(...) - 0.47) * 1.9 + 0.5;`

## Detail frequency has to match the shot, not the close-up

Procedural detail added so a surface survives an extreme close-up will destroy
the same surface's large shapes at normal distance. Sampling a planet's normal
at 260 cycles averaged the continents into grey. Keep the base map leading and
the procedural term at ~30 cycles for shape, ~200 for texture, at low amplitude.

## Atmosphere: a fresnel cannot do it when you skim the limb

Grazing a planet, **every** visible surface normal is near-perpendicular to the
view, so `pow(1 - dot(N, V), k)` whitewashes the entire disc instead of drawing a
horizon band. Optical depth has to come from the view **ray**:

```glsl
vec3 ro = cameraPosition - vC;
vec3 rd = normalize(vW - cameraPosition);
float tca = -dot(ro, rd);
float b = sqrt(max(dot(ro, ro) - tca * tca, 0.0));   // ray's closest approach
if (tca < 0.0) b = length(ro);                       // planet behind us
float t = (b - uR) / (uWidth * (uRA - uR));
float band = exp(-t * t);                            // the glowing horizon
float ground = (1.0 - smoothstep(uR * 0.8, uR, b)) * uHaze;
```

Light the band at the ray's **grazing point** (`ro + rd * tca`), not at the
fragment: on a back-side shell the fragment sits on the night side and the band
goes dark. Keep `uHaze` under ~0.015 — above that it washes a soft white blob
over the middle of the disc that is easy to mistake for a blown-out cloud.

## Fixed-tap blur bands on high-contrast edges

A radial/zoom blur with N evenly spaced taps draws N ghost copies of any hard
edge — concentric arcs along a planet's limb. Jitter the tap positions per
pixel and the banding becomes grain:

```glsl
float jit = rnd(vUv * 311.0 + uTime) - 0.5;
for (int i = 0; i < 20; i++) {
  float t = clamp((float(i) + jit) / 19.0, 0.0, 1.0);
  ...
}
```

## Unlit billboards stack to a flat white blob

Hundreds of additive/alpha cloud sprites saturate. Shape their value by hand —
for a cyclone, a dark eye and a bright eyewall:

```js
const core = smoothstep(0.02, 0.16, t) * (1 - smoothstep(0.32, 1.0, t));
```

and keep each sprite's opacity low (0.05–0.2). Also give a deck an altitude well
above its own sprite half-size, or the planet surface depth-clips the sprites
into hard diagonal edges.

## Two depth ranges, two scenes

A 400 000-unit starfield and a 20-unit hand cannot share a depth buffer. Render
a `sky` scene (stars, nebulae, distant glows) with its own far camera, then the
near scene with `clear = false; clearDepth = true`. Anything that must occlude or
be occluded by the subject — a planet the subject stands beside, its clouds —
belongs in the **near** scene, scaled so it fits that range.
