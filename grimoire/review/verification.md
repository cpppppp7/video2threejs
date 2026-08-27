# Verification

## Screenshots
`forge/shot.sh out.png "http://localhost:5173/room.html?t=6&view=bed" 1600x808`
- Headless Chrome **without --disable-gpu / swiftshader** (seconds vs minutes); do not use a fresh user-data-dir (it hangs); Vite listens on `[::1]`, so use `localhost`.
- Viewport in the video's aspect ratio.
- The page clock runs ≈2.5 s ahead of `?t`.

## Side by side
`forge/compare.sh frame_01.jpg out.png cmp.jpg` → list the deviations, then fix.

## Diagnostics
- `?diag=sun`: direct sun only. Walls and ceiling must be black; check patch positions against the geometry.
- `?diag=pose`: joint values + bounding box (a "vanished" character is usually inside the duvet / a wall, or caught mid-transition).
- Never screenshot through a shared browser (ego-browser and the like) — it captures whatever tab the user is using.

## When it passes
Per object: close-up matches the reference-feature list at ≥8/10; overall: side-by-side layout / colour / light agree; motion: every scene reads as human.

## When an object "vanishes"
Do not guess. In order: (1) `Box3.setFromObject` — is the geometry where you think? (2) force all its materials to a flat red `MeshBasicMaterial` and `frustumCulled=false` — still gone? (3) log `object.parent` and `scene.children.includes(object)` — a group that was never added, or was re-parented, renders nothing while its bounding box looks fine. (4) a downward `Raycaster` at its position lists what is actually there. Real case: a search-and-replace turned `car.rotation.y = 1.22; scene.add(car);` into `car.rotation.y = 1.22; // note scene.add(car);` — the comment swallowed the add. Never append `//` comments onto a line you are replacing by string; put them on their own line.
