# Light (real window light, no painted patches)

## Structure
- Left wall = four solid boxes around a **real window opening** (castShadow). Sunlight can only enter through the hole; the frame and mullion cast real shadows.
- Roof = bright white MeshBasicMaterial plane + a shadow-casting solid slab, **covering only the room interior** (LW..LW+9 × RW..RW+9). A slab that extends past the window blocks the sun before it reaches the window and hides the sky.
- Outdoors: a large sky-gradient plane (CanvasTexture) 2.5 m outside the window.

## Materials
- Toon `gradientMap` = `[0, 150, 255]`: the bottom step must be 0, otherwise a strong sun lights every back-facing surface by (step/255 × intensity) and it reads as light leaking through the roof.
- Fabrics use MeshPhysicalMaterial with sheen; everything else is toon.

## Parameters (sunset)
- Sun: 0xffc36e, intensity 5.5, elevation ≈35°, direction as the user asks (Blue Room: from the window slanting toward the bed head, landing on the floor only).
- Hemisphere 1.7, fill 0.6 without shadows, exposure 1.38.
- Shadow map 3072; the shadow camera must cover the whole room (±16).

## Diagnostics
- `?diag=sun` turns off hemisphere/fill and leaves the sun: see exactly where direct light lands; walls and ceiling must be black.
- Patch geometry: a ray leaving the window at height y with slope s lands at x = LW + y/s. Desk and bookcase block the lower part of the window — that is physics, not a bug.
