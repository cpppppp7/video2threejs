# Solid geometry: why a procedural body looks transparent

Everything here was paid for in one rebuild, where a statue read as translucent
glass for several review rounds. None of it is a material problem. Check these
in order before touching a material.

## The winding of a hand-built tube

A swept tube (`tubeAlong`-style: rings along a curve, quads between them) has
two possible triangle orders and only one of them faces outward.

```js
const a = i * (seg + 1) + j, b = a + seg + 1;
idx.push(a, b, a + 1, b, b + 1, a + 1);   // WRONG: faces point INWARD
idx.push(a, a + 1, b, b, a + 1, b + 1);   // right
```

Get it wrong and `computeVertexNormals()` bakes inward normals, `FrontSide`
culls the outer shell, and **you see the far inside wall of every tube**. The
whole figure looks see-through and "badly stitched": tube mouths show dark
rings, spheres show flat cut discs, cloth shows what is behind it. Because it
still shades and still occludes *some* things, it reads as a material bug and
sends you off tuning `transmission`, `clearcoat` and `roughness` for an hour.

Verify with a straight test tube along +Y: at ring angle 0 the outward direction
is +Z, so the triangle normal must come out +Z. The end caps use a different
formula and are usually already correct — do **not** flip them along with the
sides.

## Open surfaces masquerading as solids

- `LatheGeometry` is an **open** tube: no top, no bottom. Back faces culled, you
  look straight through it at the joints inside. Build a body with a capped
  sweep instead.
- A single-sheet garment (a robe surface) is fine as `DoubleSide`, but only if
  the body underneath is genuinely closed.

## The diagnostic ladder for "it looks transparent"

Three renders settle it:

1. `?diag=flat` — swap every mesh for one opaque `MeshLambertMaterial`.
   Still see-through → it is **geometry**, not material.
2. `?diag=norm` — `MeshNormalMaterial`, `DoubleSide`. Inverted winding shows up
   as normals that read inside-out across a whole class of objects.
3. `?off=<part>` — hide named parts one at a time. Name every sub-mesh
   (`robe`, `hem`, `flap`, `socket`, …) and route the query param through a
   lookup, so isolating a stray shape is one URL away.

## Seams, rims and shelves where two primitives meet

A body made of intersecting primitives leaks light at every junction. Each of
these produced a visible artefact:

| Artefact | Cause | Fix |
|---|---|---|
| Flat shelf across the chest | the torso sweep's **top cap** sitting proud of the neck | extend the profile upward with two narrow rows so the cap ends up inside the neck |
| Bright thin arc at the throat | a separate neck primitive's **rim**: the neck is round, the torso is flattened, so their cross-sections cross somewhere | **merge neck and torso into one continuous profile** — one surface has no rim to catch light |
| Elliptical disc at a joint | the limb tube's flat end cap showing because the joint ball is smaller than the tube | joint balls must be **larger** than the tube ends they cap |
| Dark V across the chest | a tube laid across the shoulders as a "yoke": its unlit underside | give the torso profile a shoulder bulge instead, so shoulders belong to the body |
| Ball stuck on a shoulder | a deltoid sphere sitting on the surface | bake the deltoid into the torso profile (`k += 0.26 * gauss(y - shoulderY, 8) * |sin th|^1.6`); keep only a small ball to fill the socket, buried |
| Bright sliver at the back of a collar | a closed-loop tube whose two **open ends** meet | run the loop slightly past the seam (θ from −π−0.18 to π+0.18) so the ends tuck inside each other |

The general rule: **prefer one continuous surface to two tucked-together ones.**
"Far enough inside that it cannot show" is not a stable property once the two
shapes have different cross-sections, or once a joint rotates.

## Proportion, not detail

Two numbers did more for believability than any amount of sculpting:

- **A torso is flat front-to-back.** A solid of revolution is a balloon. Scale
  the body's depth to ≈ 0.62 of its width, and apply the same factor to the
  garment that wraps it so the cloth still sits on the body.
- **Fingers are about as long as the palm.** A broad palm with stubby fingers
  reads as a cartoon glove instantly. Palm slightly taller than wide, thin
  front-to-back, tapering toward the wrist; fingers ≈ 4–5 : 1 length-to-width
  (thinner than that and they become ribbons); the thumb thick, splayed out and
  forward. Tuck the wrist ball inside the heel of the hand.
