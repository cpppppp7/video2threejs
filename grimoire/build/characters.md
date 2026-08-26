# Characters

## Rig
root (YZX) → hips → torso → head / shoulders (L, R) → arm; hips → thigh (L, R) → knee → calf + foot.
Pose parameters: `pose({x, z, ry, rx, rz, hipsY, torsoX, headX, headY, aLx, aLz, aRx, aRz, tL, cL, tR, cR, phone, via})`.

## Joint conventions (verified numerically with node)
- Root Euler order **YZX**: rx pitches the body flat → rz rolls about the body's long axis → ry sets the heading.
- On the back `rx = -π/2`; prone `rx = -π/2, rz = π`; on the side `rx = -π/2, rz = ±π/2` (+ lies on the right side); lying on the bed with the head toward the headboard wall `ry = 0`.
- Thigh rotX **negative = swings forward/up**; calf rotX **positive = folds backward** (prone kicking uses positive; a seated shin hanging down uses positive).
- Arm rotZ ± lifts outward/up (±2.75 = overhead); rotX negative reaches forward.

## Look
- Anime proportions: head r 0.165, long slim legs, oversized hoodie capsule (0.235), print as a CanvasTexture decal on the chest.
- Face: white sclera ellipsoids + blue iris + pupil + highlight + small mouth.
- Hair = **LatheGeometry bell helmet**: profile points ordered **bottom to top** (outward normals), `phiStart/phiLength` cut out the face wedge, the fringe is a separate front-wedge lathe cut straight at the brow; material DoubleSide. The user explicitly rejected stringy locks and ponytails.
- three.js gotchas: SphereGeometry φ=0 is on -X and the front is φ=π/2; LatheGeometry φ=0 is on +Z.

## Motion
- Scene-table driven: 4.5 s per scene, 1 s transitions; if adjacent scenes are more than 0.3 apart the character walks (leg swing); `via` names a waypoint (around the bed foot).
- Bed edge sit hipsY ≈ duvet top + 0.25, lying on the bed ≈ duvet top + 0.4; floor sit 0.24, side-lying 0.24, on the back 0.17.
- For every lying pose: `?diag=pose` prints joint values and the bounding box, then screenshot from a suitable camera. The screenshot clock runs ≈2.5 s ahead of `?t`; avoid scene transitions.
