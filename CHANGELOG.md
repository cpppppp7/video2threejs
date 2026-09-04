# Changelog

## 2026-09-04 — Kami: the sculpted Buddha
- New `grimoire/build/one_mesh_sculpting.md`: one closed surface shaped by its
  own vertices; when to sculpt vs when primitives are correct; the two
  substrates; **reason first, then sculpt in steps, each step finished**;
  sculpting hygiene (smooth masks, field fade-out, feature width, fold limit,
  monotonic centre lines) and the diagnostic set.
- New `grimoire/build/box_modelling.md`: cage operator set (turned extrudes,
  absolute-extent extrudes with shift, group extrude, loops with a region
  predicate, cap tilt), the both-ways loop rule, the manifold check, landmark
  capture timing, profile preservation, branch roots.
- New `grimoire/build/skinning_rig.md`: rigid-segment weights with a
  one-diameter blend, joint loops fanned on the joint, half-rotation bones,
  deriving joint axes (the wrist flexion axis), pattern-search IK with flat-palm
  restarts, joint stagger vs sampled poses, monotonic gestures.
- New `grimoire/build/volumetrics.md`: fire as a stack of noise-sliced
  translucent shells, mushroom profile, noise-carved density, deep core to light
  rim, fill-rate budget, world-aligned billboards, effects keyed to the clip.
- `build/procedural_recipes.md`: close-up detail on a sculpted hand.
- `build/camera_ux.md`: per-shot near planes, rig-following cameras, fixed
  look-axis for fly-throughs, per-shot composites, third-person operator mode.
- `build/motion_timeline.md`: world effects vs shot effects, slow motion as a
  clip window, ignition timing.
- `feedback/user_signals.md`: the sculpted-Buddha "no" list.
- `SKILL.md`: three new hard rules (one mesh sculpted; reason then step;
  verify with numbers), rig/axis guidance in the motion rule, new pipeline
  stages, twelve new anti-patterns, new debug parameters.
- New `examples/kami-buddha-sculpt.md`.

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
