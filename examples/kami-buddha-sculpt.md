# Case study — the sculpted Buddha (head, body, hands) and its film

**Reference:** the same 25.68 s screen recording as `palm-of-the-buddha.md`, but
this time the figure is not assembled from primitives — it is **one sculpted
head, one sculpted body-and-robe, one sculpted hand**, rigged, animated, and put
back into the same earth scene for a 25.7 s cut.

**Rebuild:** `/sculpt.html` (the workshop) and `/buddha.html` (the film),
`src/statue2.js` + `src/body2.js` + `src/body.js`, zero asset files.

## Why the whole figure was rebuilt

The first statue was primitives tucked together. Every review round found a
seam, a ring, or a part that came loose when a joint turned. The user's brief was
one sentence and it settled the architecture:

> "I want the neck, the body, the robe and the arms to be **one mesh** — sculpted
> by bulging, sinking, changing slope, moving a ring of vertices — like the head."

Everything below follows from that.

## Head — a displacement field, step by step

Base: a superellipsoid sphere. Every feature is a term in `faceR(x, y, z)`.
The order was the user's, one sign-off per arrow:

> blank face → step the whole face back except the forehead-and-nose T →
> eyes → mouth → nose → ear → hair

What each step taught:

- **Blank first.** Two earlier attempts sculpted feature-by-feature onto a face
  that already had problems; both were thrown away. `?blank=1` has to be clean.
- **The T/Y keep-out.** The forehead and the nose bridge stay at full radius
  while the rest of the face steps back 0.07 R. The corner where they meet must
  be a small curve, not a right angle.
- **A centre-line form is one monotonic curve.** The nose was "sunken" through
  four attempts because a ridge saturating into a tip ball left a plateau at
  f 0.54–0.59. `A · t^1.35` straight to the tip fixed it. The lesson is general:
  **dump the profile, do not look at it**.
- **The ear is grown out of the skull**, not a separate plate: a footprint
  polygon on the head, a signed distance field to it, and a lift along the skull
  normal with a smootherstep ramp, blurred over the lat-long grid. Separate ear
  meshes were rejected three times before this.
- **Curls are instanced solids on the finished skull** — jewellery, not skin —
  packed by a greedy size field with an exact hairline and an ear ring.

## Body — a cage, subdivided, then sculpted

An SDF + marching cubes body came first: it produced seams at the smin joins,
negative-imprint bands, and staircase aliasing, and the user threw it out. The
replacement is box modelling: a ~330-quad cage, Catmull-Clark ×5, then
displacement for pecs, deltoids, the shoulder strap, robe folds and sleeve folds.

Operators worth having, and the traps, are in `grimoire/build/box_modelling.md`.
The three that cost the most:

1. **`insertLoop` walking one way** left T-junctions along the palm; subdivision
   drew them as a hard line that survived every "smoothing" attempt.
2. **Landmarks captured after later extrusions** put the palm centre on a
   fingertip, so every IK target was a hand-length out.
3. **Loops running out of the hand** into the arm and torso squared off the body
   and flattened a sleeve while the user had only asked for a hand fix.

## Hand — the close-up bar

Fingers pulled from a knuckle block (all four roots extruded **together**), a
thumb wedge from the palm's edge, then displacement detail: one faint groove per
joint on the palm side, a knuckle swell with three faint wrinkles on the back,
level U-shaped nails with a fold groove, MCP mounds and web fillets, a
five-step palm taper so the heel has no ridge.

The two most repeated notes: **fade a field before it reaches the next part**
(a hard distance cut wrote "cracks" along every finger), and **a sunk nail plate
reads as a pit** — keep it level and define it with the groove.

## Rig and gesture

Rigid segments, a short hinge, a half-rotation bone, cage loops fanned on the
joint, and IK-solved keys for the poses that must land somewhere exact
(`turn / press / strike` onto the impact point, palm flat on the surface).

The bug worth remembering: **the wrist's flexion axis is `forearm × palmNormal`**.
Built on the elbow's hinge axis it did nothing at all — measured, not guessed:
sweeping the wrist ±30° changed `palmNormal · target` by 0.000.

## The film

Six shots on one world (S6 folded into S5). What this pass added over the first
film:

- **World FX**: the eruption is a function of the hand clip's time, so S4 (the
  descent, in slow motion at 0.21×) shows the fire already spreading, S5
  continues the same fire, and a user orbiting freely sees the same event.
- **Per-shot near planes**: the curls' flicker in S1 was depth-buffer precision,
  not a material.
- **A fixed look-axis** for the fly-through between the fingers; aiming at the
  impact made the world swing as the camera passed it.
- **A per-shot composite** for S1: the reference's huge head *and* full earth
  limb cannot coexist at one scale, so the world is scaled and placed for that
  shot only, and restored on leave.
- **Operator mode**: a `V` avatar that is the orbit pivot, `WASD`/`QE` to walk
  it, `B` to replay the strike once and clamp on the finished blast.

## What the user rejected along the way

Separate meshes for anything organic · a web filling a notch that was asked to
be *moved* · pink palm glow · a painted nebula · brighter "improved" bronze ·
a solid modelled explosion cap · heavy orbit damping · any edit to a part the
task did not name.
