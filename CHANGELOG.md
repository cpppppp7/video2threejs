# Changelog

## 2026-08-30 — Palm of the Buddha
- New `grimoire/build/solid_geometry.md`: swept-tube winding, open lathes, joint
  caps, seams where primitives meet, and the `flat → norm → off` diagnostic
  ladder for "it looks transparent". Body/hand proportion rules.
- New `grimoire/build/shader_traps.md`: the shader-error hook, `modelMatrix`
  scope, GLSL undefined behaviour, biased integer hashes, detail-frequency vs
  shot distance, ray-based atmosphere, blur tap jitter, billboard saturation,
  two-scene depth split.
- New `forge/solve_camera.mjs`: general camera solve from two landmarks' NDC and
  apparent size.
- New `forge/solve_ik_arm.mjs`: arm poses from palm position / normal / finger
  direction, with a continuity term for keying a gesture.
- `space/perspective_solving.md`: landmark solving, elevation constraints, the
  triangle-inequality test for references that are composites, broadside camera
  sweeps.
- `build/characters.md`: joint chains for limbs that act, inverted head pitch,
  humerus twist, IK-solved pose keys, per-shot pose warping.
- `SKILL.md`: two new hard rules (closed solids/winding; shaders fail silently),
  "decide what moves" in the analysis rule, new anti-patterns and debug params.
- New `examples/palm-of-the-buddha.md`.

## 2026-08 — Golden Hour
- Golden Hour case study; fxtwitter media fetch; vanished-object diagnostic ladder.

## 2026-08 — Blue Room
- Initial skill: live preview, multi-frame analysis, perspective solving, detail
  sculpting, research-when-unsure, screenshot-verified iteration.
