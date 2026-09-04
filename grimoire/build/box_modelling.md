# Box modelling: cage operators + Catmull-Clark

For a body, limbs, hands and clothing, a displacement field on a sphere runs out
of topology. Build a low-poly **cage** instead, subdivide it, then sculpt the
subdivided skin with fields. One mesh throughout; the rig binds to it.

## The operator set worth having

| Operator | What it does | Why you need it |
|---|---|---|
| `box` | the starting solid | — |
| `extrude(face, offset, scale)` | push a face out | the basic growth step |
| `extrudeAlong(face, dir, len, scale)` | extrude with the cap **turned** to face `dir` | a bent tube; extruding along a direction without turning the cap gives a sheared sheet |
| `extrudeAlong2(face, dir, len, sU, sV, uHint)` | in-plane anisotropic scale | a limb that is wider than it is thick, at any world angle |
| `extrudeAlongAbs(face, dir, len, halfU, halfV, uHint, shift)` | absolute half-extents plus a lateral shift | "0.29 × 0.10 H section, back face flush" — the only way to keep one side of a taper straight |
| `extrudeGroup(faces, dir, len, shrinkFn)` | extrude several faces **as one block**; no wall on a shared edge; optional reshaping function | four finger roots must rise together, or every pair of neighbours gets a wall and the gaps run to the palm |
| `inset(face, k)` | inner ring on a face | cloth thickness, a cuff |
| `insertLoop(face, edge, t, allowed)` | edge loop across a face, walking the strip | places a cut where you need one |
| `tiltCap(face, axis, angle, ...)` | rotate a cap in place | fan the loops around a joint |
| `faceExtents(face, uHint)` | measure a face | never guess the section you are extruding from |

## The rules that cost a rebuild each

**1. A loop must walk both ways from its start face.** A one-way walk splits the
faces on one side of the cut and leaves the other side holding one long edge
across the new vertices — a T-junction. Catmull-Clark renders a T-junction as a
hard crease. This was the mystery line across a palm that survived three rounds
of "smooth it".

**2. After any cage op, count the edges used by ≠ 2 faces.** Non-zero means a
boundary or a T-junction, and every one of them will be visible after
subdivision. Ten lines of node:

```js
const ec = new Map();
for (const f of m.f) for (let k = 0; k < f.length; k++) {
  const a = f[k], b = f[(k + 1) % f.length], kk = a < b ? `${a}_${b}` : `${b}_${a}`;
  ec.set(kk, (ec.get(kk) || 0) + 1);
}
console.log('non-manifold/boundary:', [...ec.values()].filter((c) => c !== 2).length);
```

**3. Loops must terminate on a pole, not run into the neighbouring region.**
Give `insertLoop` an `allowed(faceIndex)` predicate; when the walk reaches a face
outside the region, close the current face as a triangle + quad and stop. Without
this, cutting finger roots propagates loops up the arm and squares off the torso
— a real regression that made a user furious, and rightly.

**4. Capture landmarks at the moment they exist.** Extrusion reuses the face
index, so a face you grab later is a different face: a "palm centre" recorded
after the fingers were pulled sat on a fingertip, and every IK target built on it
was wrong by the length of a hand. Clone the position when the face is still the
face you mean.

**5. Preserve a profile you are lengthening.** If you make a segment longer to
move a junction, set its end section to exactly what the old taper had at that
height, and shorten the following steps to match. Otherwise you have silently
introduced a new slope break somewhere else — the fix for one dent creates the
next one.

**6. A branch's root is the base face, not the extruded stub.** Where a thumb
leaves a palm, the bottom of the V between them is the *base face's* upper edge.
Moving the extruded wedge moves the far end of the thumb and leaves the V where
it was. Move the face. (And do not fill the V with a web to hide it; that is a
different feature, and the user will notice.)

**7. Subdivision level is a budget.** Level 5 on a ~330-quad cage is ~660 k
triangles — fine for one hero figure, and enough that a 0.005 H crease is three
vertices wide. Going to 6 for one detail quadruples the skinning cost of the
whole body.

## Sculpting the subdivided skin

Displacement fields, exactly as in `one_mesh_sculpting.md`, keyed to landmarks
recorded during cage building (joint positions, palm centre, knuckle line, digit
axes). Two extra rules for this stage:

- **Per-part field ownership must fade.** `if (dist > 1.6 * r) continue;` writes
  a jagged seam onto every neighbouring part, because the neighbour is only ~2 r
  away. Multiply the part's contribution by `smoothstep(1.45 r, 0.95 r, dist)`
  instead — the cracks along the fingers were exactly this.
- **Measure lanes, not vibes.** A small node script that rebuilds the geometry
  and prints the surface offset along a lane (across the palm, along the centre
  line) tells you in one line whether a "ridge" is a ridge, and whether your fix
  removed it.

## Smoothing is a last resort

A normal-direction Laplacian pass over a masked region can flatten a bump, but
it also eats the shapes you meant. If a crease survives smoothing, it is
topology (see rules 1–2), not shading — fix the cage.
