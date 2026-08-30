# Case study — Palm of the Buddha

**Reference:** a 25.68 s screen recording at 2.34:1. A colossal glass Buddha
beside the Earth raises a hand in abhaya mudra, the palm ignites, and he presses
it down onto the world; a golden flash blooms on the surface.

**Rebuild:** `/buddha.html` — five modules, ~2 000 lines, zero asset files.

## Shot table

Cuts detected with `ffmpeg -vf "select='gt(scene,0.3)',metadata=print"`:
**4.85 / 6.45 / 16.68 / 19.97 / 23.20 s**.

| # | Content | What moves |
|---|---|---|
| S1 | Head above the earth's limb, arm still at his side | camera drifts |
| S2 | 1.6 s live-action insert | — (stylised stand-in) |
| S3 | Arm rises into abhaya; the palm ignites and burns the frame out | **the arm**, camera pushes slowly |
| S4 | The palm descending on the world, seen from the **side** of the hand | the arm |
| S5 | Dive from above the hand, through the fingers, onto the planet | camera |
| S6 | Golden flash on the planet's surface | — |

Getting S3 wrong the first time cost a rebuild: it was animated as a camera push
on a static statue, when the reference is a near-static camera watching an arm
rise. **Ask what moves before you rig anything.**

## One world, no per-shot cheating

The user's brief was blunt and correct: *one earth, a Buddha beside it, his palm
comes down — the rest is just camera angles.* So:

- earth sphere R=90 at the origin;
- statue head centre at `(124, 110, 0)` with `rotation.y = -π/2`, so its local +Z
  (its front) points at the origin — it **faces** the world it is about to touch;
- local → world for that yaw is `(x, y, z) → (-z, y, x)`;
- the impact normal `U` and the palm's rest position follow from the strike pose,
  not the other way round.

Turning the figure to face the earth invalidated every pose (the arm had been
reaching sideways) and every camera. That is the cost of getting the layout
decision late — settle "what faces what" in the space stage.

### The reference is a composite

S1 wants the head at 19° angular radius **and** an earth limb at 79°. That forces
the camera within `dA + dB ≈ 8.2 rA` of both, against a layout that needs
`L ≈ 11.8 rA` between them. No single scale satisfies both shots; the original
composited them. Recorded the deviation and took the closest coherent framing —
camera skimming the planet, limb crossing in front of the statue, only his upper
body above it. That framing came from the user orbiting the scene and screenshotting
what they wanted, which is worth asking for directly.

## Bugs that cost the most

1. **Inverted tube winding.** `idx.push(a, b, a+1, …)` instead of
   `idx.push(a, a+1, b, …)` made every swept tube face inward. `FrontSide` culled
   the outer shell, so the torso, robe, arms and neck all showed their insides.
   It reads exactly like translucency, and several rounds went into material
   tuning before `?diag=flat` proved it was geometry.
2. **A biased `hash3`.** `x*A + y*B` overflowed to double before the bit ops:
   mean 0.26, max 0.42. Every procedural texture in the scene was flattened — a
   planet with no continents, clouds as one grey sheet. `Math.imul` throughout.
3. **GLSL NaN.** `pow(negative, 2.0)` and `smoothstep(hi, lo, x)` are undefined;
   the atmosphere shell silently rendered nothing.
4. **`modelMatrix` in a fragment shader.** Found in one render, but only after
   installing `renderer.debug.onShaderError` — install it first.
5. **Fresnel atmosphere.** Skimming the limb, every visible normal is
   near-perpendicular to the view, so the fresnel whitewashed the whole disc.
   Rewrote it as optical depth from the view ray's closest approach to the centre.

## Techniques worth reusing

- `forge/solve_camera.mjs` — cameras solved from two landmarks' measured NDC and
  apparent size. Constrain elevation, and always constrain a size.
- `forge/solve_ik_arm.mjs` — poses specified as palm position + palm normal +
  finger direction, keyed in sequence with a continuity term so four keys form
  one gesture.
- `aimAt(cam, target, ndcX, ndcY, fov)` in the scene itself, so shot definitions
  are measurements rather than look-at guesses.
- A `poseU(u)` hook per shot to warp gesture timing inside a shot (raise the arm
  over the first 30 %, then hold) without splitting the shot.
- A pictorial back light (`heroGlow`) a shot can park near a landmark, for the
  blown-out key the reference has behind the subject.
- `?off=<part>` wired to named sub-meshes: isolating a stray shape is one URL.

## User corrections, in order

Each of these arrived as a screenshot and each was right:

1. "The earth is the foreground, the Buddha is behind it."
2. "It is simple — one earth, one Buddha, palm strikes. You are only doing camera
   angles." → the single-world refactor.
3. "The Buddha faces the Earth; right now the Earth is off to his side."
4. "The body is still transparent." (three times, before the winding bug was found)
5. "Why is the body round like a balloon? A body is flat." → `BODY_Z = 0.62`.
6. "The fingers are short and the palm is swollen — it looks comical."
7. "The final flash is on the earth's surface, not in space."
8. "S4's first shot is the side view; the top view is the second one."
9. "In S1 the arm is still down; it only rises in S3."
