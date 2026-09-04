# Camera experience

- OrbitControls: drag to rotate, wheel to zoom, right-drag to pan; clamp with `minDistance / maxDistance / maxPolarAngle`.
- The initial camera comes from `solve_camera.py`; the user can press `C` to copy the current `CAM / LOOK / fov` and send it back; `R` resets; localStorage remembers the user's view.
- Intro: overview from a high inside corner (4 s, slow dolly in) → detail 1 (desk corner) → detail 2 (bed) → 2.8 s blend into the initial camera, then hand control back; click/key skips; not played when `view` / `diag` params are present.
- The overview camera must stay under the roof and inside the walls, or it films the back of the ceiling.

## Near planes are per shot

One near plane for a whole film is a bug. A 0.25 near plane (needed by a
fly-through that passes between fingers) leaves the depth buffer no precision at
650 units, and small solids sitting on a surface — hair curls on a skull —
z-fight and **flicker frame to frame**. It looks like a material or a render
bug; it is the projection. Give each shot its own `near` (hundreds of units for
a long-lens shot, single digits for a close one), and in free orbit scale it to
the pivot distance (`≈ 2 %`), updating the projection matrix when it changes.

## Camera paths that follow a rig

A camera anchored to a moving hand needs the *posed* landmark, not the bind one:
take the point in mesh space, apply the bone's inverse bind matrix, then the
bone's current world matrix. Two ordering rules:

- **pose first, then place the camera** inside a shot's update;
- call `updateWorldMatrix(true, true)` on the character after posing, or the
  camera reads last frame's pose and the first frame of the shot jumps.

**Look along a fixed axis when flying past something.** Aiming at a point you
are about to pass makes the view swing through 180° as you cross it, and the
world appears to spin. Aim along a stable direction instead (the hand's own
dorsal axis, the planet's normal), and the frame stays still while you move.

## Per-shot cheats are allowed for composite references

If the reference frame is a composite that no single camera can reproduce, it is
legitimate to move or rescale a *scene object* for that shot only (a smaller
world brought closer so its limb crosses under a chin) — as long as you restore
it in the shot's `leave()`. Solve the placement in frame angles (disc radius and
centre in degrees) rather than by dragging.

## Third-person operator mode

For a user who is going to record the scene by hand, the orbit target should be
a **character they drive**, not the far scene centre:

- a visible marker at the pivot (a small glow ball), toggled by a key (`V`);
- `WASD` walks the pivot on the ground plane, `Q/E` raises and lowers it; the
  camera keeps its offset, so dragging always orbits what they walked to;
- keep the pivot's world position on the marker every frame;
- speed scales with the viewing distance; a light velocity smoothing (~0.15 s)
  reads as a stabiliser. **Do not over-damp** — heavy damping and a slow zoom
  feel broken; damping 0.06 and a snappy wheel are what a user asks for back.
- a key (`B`) that replays the scene's action once and clamps on the last frame.
