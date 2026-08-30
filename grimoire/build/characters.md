# Characters

## Rig
root (YZX) → hips → torso → head / shoulders (L, R) → arm; hips → thigh (L, R) →
knee → calf + foot.
Pose parameters: `pose({x, z, ry, rx, rz, hipsY, torsoX, headX, headY, aLx, aLz, aRx, aRz, tL, cL, tR, cR, phone, via})`.

For a limb that **acts** in the film, build a real joint chain instead of
hard-coded tube positions: shoulder → elbow → wrist groups, each segment modelled
along its own local −Y, Euler order `ZXY`, and the hand carrier flipped π about X
so the fingers continue along the forearm. Then abduction, twist, flexion and the
wrist are four numbers you can key and interpolate.

## Joint conventions (verified numerically with node)
- Root Euler order **YZX**: rx pitches the body flat → rz rolls about the body's
  long axis → ry sets the heading.
- On the back `rx = -π/2`; prone `rx = -π/2, rz = π`; on the side
  `rx = -π/2, rz = ±π/2`; lying with the head toward the headboard `ry = 0`.
- Thigh rotX **negative = swings forward/up**; calf rotX **positive = folds
  backward**.
- Arm rotZ ± lifts outward/up (±2.75 = overhead); rotX negative reaches forward.
- Head `rotation.x` is **inverted from intuition**: `Rx(+t)` sends the face
  **down**. A downcast gaze is a positive angle. Check this rather than assuming;
  it shipped a Buddha staring at the ceiling for a whole review round.
- On a shoulder with order `ZXY`, `ry` is applied first and is therefore the
  **humerus twist**. Without it, flexing an abducted arm bends it sideways
  instead of raising the forearm.

## Solving poses instead of dialling them
A dramatic gesture is far easier to specify as *palm here, facing that, fingers
that way* than as seven angles. `forge/solve_ik_arm.mjs` takes a target palm
position, palm normal and finger direction and returns the joint angles.

Solve the keys **in sequence**, feeding each result in as `prev`. The continuity
term is what makes it usable: without it the solver picks a different branch of
the solution space for every key (twist jumping −66° → −172°), and interpolating
between them flails. With it, four keys read as one continuous movement.

Also expose a URL pose dial — `?pose=sz,sx,sy,ex,wx,wy,wz` — so a pose can be
nudged without an edit/reload cycle, and `?key=<name>` to jump to a named key.

## Look
- Anime proportions: head r 0.165, long slim legs, oversized hoodie capsule
  (0.235), print as a CanvasTexture decal on the chest.
- Face: white sclera ellipsoids + blue iris + pupil + highlight + small mouth.
- A stylised/statue face needs **much** stronger displacement than looks right in
  a wireframe: a chrome or jade material eats subtle form. Brow ridge, lid crease,
  nose bridge and lip line all wanted roughly double the amplitude that seemed
  reasonable before the first render.
- Hair = **LatheGeometry bell helmet**: profile points ordered **bottom to top**
  (outward normals), `phiStart/phiLength` cut out the face wedge, the fringe is a
  separate front-wedge lathe cut straight at the brow; material DoubleSide. The
  user explicitly rejected stringy locks and ponytails.
- three.js gotchas: SphereGeometry φ=0 is on -X and the front is φ=π/2;
  LatheGeometry φ=0 is on +Z.
- Body proportion and joint construction: see `build/solid_geometry.md`.

## Motion
- Scene-table driven: 4.5 s per scene, 1 s transitions; if adjacent scenes are
  more than 0.3 apart the character walks (leg swing); `via` names a waypoint.
- Bed edge sit hipsY ≈ duvet top + 0.25, lying ≈ duvet top + 0.4; floor sit 0.24,
  side-lying 0.24, on the back 0.17.
- For every lying pose: `?diag=pose` prints joint values and the bounding box,
  then screenshot. The screenshot clock runs ≈2.5 s ahead of `?t`.
- **Let a shot warp its own pose blend.** A `poseU(u)` hook per shot — e.g.
  `smoothstep(0.02, 0.30, u)` to raise an arm over a shot's first third and then
  hold — keeps gesture timing in the shot table instead of forcing you to cut the
  shot in two.
