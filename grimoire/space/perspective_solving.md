# Space and camera solving

## Coordinate conventions
- Interior, two visible walls: left wall `x = LW`, right wall `z = RW`, corner at
  `(LW, RW)`; the room opens toward +x and +z (camera side).
- y up; floor y=0; ceiling 3.4; character height ≈1.55; mattress top 0.5–0.6.
- Exterior / a figure in space: put the subject at the origin of its own frame
  facing +Z, so its **right** hand sits at local −X and therefore reads on the
  **left** of frame for a camera on +Z. Then place that frame in the world.

## Solving the camera from landmark fractions (interiors)
1. Read the **horizontal fraction** of several landmarks in the reference frame.
2. Give each landmark a world position from the layout contract.
3. `python3 forge/solve_camera.py landmarks.json` grid-searches camera (x, z),
   heading and horizontal fov to minimise the fraction error.
4. Height and pitch: the horizon's height in frame ≈ camera height; whether the
   ceiling line is in frame sets the pitch.

## Solving the camera from two landmarks (anything)
`forge/solve_camera.mjs` is the general version and the one to reach for when
there is no room to give you wall lines. Measure, for two bodies whose world
positions you know:

- the **NDC** each occupies (x right, y up, ±1 at the frame edge), and
- the **apparent radius** of at least one, as a fraction of the frame's half
  height (`radiusPx / (frameHeightPx / 2)`; multiply a width measurement by the
  aspect ratio first).

It aims the camera so landmark A lands exactly on its NDC and searches position,
heading and fov to fit the rest. Two rules from using it in anger:

- **Constrain the elevation.** The solution family is usually ambiguous, and the
  unconstrained best fit will happily put the camera above a subject that the
  reference obviously looks up at. Bound `el` to the half you can see is right.
- **Always constrain a size.** Position alone lets the solver slide the camera
  along the view ray, and it will pick a distance that makes the hero object a
  quarter of its reference size.

Then aim shots in code, not by hand: keep an `aimAt(cam, target, ndcX, ndcY, fov)`
helper that returns the look-at point placing `target` at a measured screen
position. Shot definitions become measurements rather than guesses, and
re-framing is a one-number edit.

## Check the reference is possible before chasing it

A reference clip is often a **composite**, and no single scale can satisfy all
of its shots. Test it early with the triangle inequality, and you save hours:

> Shot 1 wants subject A at angular radius `α` and body B at `β`.
> Then the camera is `dA = rA / sin α` from A and `dB = rB / sin β` from B.
> If the world says `|A − B| = L`, the shot exists only if
> `|dA − dB| ≤ L ≤ dA + dB`.

In one rebuild the opening shot demanded a head at 19° *and* a full-frame planet
limb at 79°, which forced `dA + dB ≈ 8.2 rA` against a layout that needed
`L ≈ 11.8 rA`. Impossible. That is not a failure to reproduce — the original had
composited two elements. Say so, pick the closest coherent framing, and record
the deviation in the project's `CLAUDE.md`. Do not keep re-solving.

## Reading rules
- Small angle between the left wall and the view direction → "looks head-on";
  similar angles for both walls → "looking into the corner".
- Screenshot viewport must use the video's aspect ratio, or comparisons lie.
- When the user finds a better view with OrbitControls, have them press `C` to
  copy the camera and paste it back; hard-code it.
- When a shot must show a body **broadside** (a hand's fingers, a face), place
  the camera in the plane perpendicular to that body's long axis and sweep four
  candidate azimuths in that plane. Rendering four and picking one beats
  reasoning about it; a camera even 30° off the perpendicular collapses fingers
  into a mitten.
