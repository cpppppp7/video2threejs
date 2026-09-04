# One mesh, sculpted — the default for organic subjects

The failure this file exists to prevent: an organic form (a head, a torso, a
hand, an ear, a robe) assembled from primitives — a sphere plus a cone plus a
capsule, tucked into each other and hoped to read as one body. It never does.
Every one of these appears, on every rebuild, and each costs a review round:

- a bright seam where two cross-sections meet, moving as the light moves;
- an outline ring around a part that sits *inside* another part;
- a piece that detaches the moment a joint rotates or a proportion changes;
- z-fighting shimmer where two surfaces are nearly coincident;
- a "transparent" look from one wrongly wound sub-mesh;
- a shading discontinuity no material tuning can remove, because it is geometry.

The method that has none of these: **one closed surface, shaped by moving its
own vertices** — bulge it out, sink it in, extrude a limb from a face of it,
displace it with a smooth field. There is nothing to seam because there is only
one skin.

## When to use which

| Subject | Method |
|---|---|
| Head, face, ear, torso, limb, hand, robe, cloth, any living or grown form | **One mesh, sculpted.** Start from a sphere or a box cage and shape it. |
| A part that is genuinely a separate object in the reference (a lamp, a book, a beam, a pole, a window frame) | Separate primitives are correct — they *are* separate. |
| Repeated small solids that sit ON a surface and never deform (hair curls, rivets, beads, blossoms) | Instanced solids placed on the sculpted surface. They are jewellery on the skin, not part of it. |
| Long thin sweeps (a cable, a stem, a strand) | A swept tube — one continuous sweep, not a chain of capsules. |

Rule of thumb: **if two parts share skin in the reference, they must share a
mesh in the build.** A nose is not attached to a face; it *is* the face, pushed
forward. An ear is not glued to a head; it is the skull's surface, raised.

## The two sculpting substrates

**Displacement field on a subdivided primitive.** Best for a head or any form
whose silhouette is close to a sphere/ellipsoid. Keep the base geometry dense
and untouched; write `r(x,y,z)` — a sum of smooth masks — and move each vertex
along its normal. Every feature is a term you can raise, lower or disable
independently; nothing can ever come apart.

**Box-modelling cage + Catmull-Clark.** Best for a body, limbs, hands, clothing
— anything with branching topology. Extrude the cage into the shape, subdivide,
then apply displacement fields for the fine detail. See
`grimoire/build/box_modelling.md` for the operator set and its traps.

Both end as one skin, and one skin is what the rig binds to.

## Reason first, then sculpt in steps

Sculpting is not a single act. Before touching geometry:

1. **Reason about the form.** What is the base volume? Which features are
   raised, which are sunk, which are a change of slope? Where is the boundary of
   each? Write this down as an ordered list — the order matters, because each
   step is built on the surface the previous one left.
2. **Split into steps that each leave a valid, checkable surface.** Blank base →
   the large planes → the primary features → the secondary features → the fine
   detail. Never a step whose result can only be judged once a later step lands.
3. **Finish each step before starting the next.** Screenshot it, measure it,
   show it, get it accepted. A wobble left in step 2 becomes unfixable by step
   5, because five later fields now sit on top of it.
4. **Re-measure after every step.** Dump a numeric profile across the surface
   (centre line, a lane across the palm, a ring around a joint) and check it is
   monotonic where it should be. Eyes cannot tell a plateau from a dent under
   a specular highlight; numbers can.

A worked ordering, from the Buddha head — the user drove this and it worked:

> flat blank face → step the whole face back except the forehead-and-nose T →
> eyes → mouth → nose → ear → hair.

and from the hand:

> palm block → taper into the fingers → pull the fingers → thumb → joint
> creases → nails → palm/knuckle detail.

Each of those arrows was a screenshot and a sign-off. When a later step
regressed an earlier one (a thumb fix flattening the palm's profile), the
earlier step's numbers were restored exactly, not re-eyeballed.

## Sculpting hygiene

- **All masks smooth.** A hard `if` boundary in a displacement field is a
  staircase on the surface after normals are computed. Use `smoothstep` /
  `smootherstep` and give every feature a fade-out.
- **A field keyed to one part must die before it reaches the next.** Distance
  thresholds with a hard `continue` write jagged seams onto neighbouring parts.
- **Feature width ≥ 2.5 vertex spacings**, or the feature is aliasing, not shape.
- **Displacement × the mask's max slope < 1**, or the surface folds over itself.
- **A form along a centre line is one monotonic curve.** Two gaussians handing
  over leave a plateau at the join, and a plateau between two rises reads as a
  dent — the single most repeated "why does it look sunken" bug.
- **Push-only where a profile matters.** Let features add to the base surface;
  subtracting a feature's negative imprint hollows the whole region.

## Diagnostics

- `?blank=1` — base surface with every field off. If it is not clean, no field
  will save it.
- `?diag=zebra` — striped environment; a seam or a slope break shows as a kink
  in the stripes long before it shows in a lit render.
- `?diag=clay` — flat grey material; removes the specular that hides shape.
- A numeric profile dump (`?diag=prof`, or a small node script that samples the
  built geometry along a lane) — the only honest check.
