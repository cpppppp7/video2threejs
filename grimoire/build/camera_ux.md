# Camera experience

- OrbitControls: drag to rotate, wheel to zoom, right-drag to pan; clamp with `minDistance / maxDistance / maxPolarAngle`.
- The initial camera comes from `solve_camera.py`; the user can press `C` to copy the current `CAM / LOOK / fov` and send it back; `R` resets; localStorage remembers the user's view.
- Intro: overview from a high inside corner (4 s, slow dolly in) → detail 1 (desk corner) → detail 2 (bed) → 2.8 s blend into the initial camera, then hand control back; click/key skips; not played when `view` / `diag` params are present.
- The overview camera must stay under the roof and inside the walls, or it films the back of the ceiling.
