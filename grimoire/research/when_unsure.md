# When you do not know how

1. Search first: three.js official examples (cloth, instancing, lathe), discourse.threejs.org, sibling skills (img2threejs `grimoire/character/*` for hair and heads).
2. Write down the viable approaches (≤3), pick the most controllable, cite the source.
3. Verify the maths directly with node (Euler order, geometry φ origins) instead of reasoning about it.
4. Record conclusions in `findings.md` in this directory.

## findings.md (recorded)
- Duvet: cloth particle simulation vs a high-resolution displaced plane — the plane is controllable; use it (see procedural_recipes).
- Hair: img2threejs' tapered ribbon lofts suit single-character close-ups; in a room scene the user found them ghostly, so use the lathe helmet.
- Euler: three.js 'YZX' = Ry·Rz·Rx; vectors are rotated by Rx first.
- Sphere / Lathe φ origin: -X / +Z.
