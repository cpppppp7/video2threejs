# Volumetric fire, smoke and blast

For an explosion, a storm or any fire that the camera flies *into*, a few
billboard sprites are not enough and a solid mesh is worse — a modelled
mushroom cap reads as "a plastic bread roll". What reads as fire is a
**translucent volume with light coming through it**.

## The recipe that worked

**A stack of thin shells**, each a sphere (or dome) at a slightly larger radius,
each shaded as a slice of one volume:

- shade by the **angular distance from the blast centre**: a bright advancing
  front (`exp(-((a - A)/w)²)`), burning material behind it (`smoothstep`), a
  soft halo beyond it;
- give the stack a **mushroom profile**: the reach `A` narrows for higher
  shells, so the silhouette is a dome with a rolled rim, not a ball;
- **each shell samples a different slice of the noise** — offset the noise
  coordinate by the layer index in all three axes. Same-phase noise on every
  shell produces visible concentric arcs, which is what "three layers of light"
  looks like;
- **carve the density with noise²**, not noise: the squared term opens holes and
  gives billows instead of a smooth glow;
- **colour by radius**: deepest flame at the centre, orange through the body,
  a lighter rim that fades to nothing. Deep core → light rim, never white core;
- `NormalBlending`, low per-shell alpha (~0.2), `depthWrite: false`, and
  `renderOrder` from the outside in so the over-blending is in the right order.

## Cost

Every shell is a full-screen transparent pass when the camera is inside the
volume. Thirteen shells with two-octave noise is a working budget for a hero
shot; twenty-two with three octaves stuttered. Levers, in order of payoff:
shell count, noise octaves, `renderer.setPixelRatio` during the fly-through
(restore it on the way out), then tessellation (which is not the bottleneck).

## Companions

- **Ejecta**: a few dozen billboarded puffs on a flattened dome (hug the
  surface — a spherical dome looks like a firework), coloured deep at the centre
  and light at the rim, ageing to char. Keep their opacity low; they are texture
  on the volume, not the volume.
- **Billboards must live in a world-aligned group.** Inside a group rotated to
  the surface normal they render edge-on and vanish.
- **Fade what the fire consumes.** A white storm deck under an orange fireball
  reads as white flecks in the core; ramp its opacity to zero as the blast
  spreads.

## Timing belongs to the world, not to the shot

Key the effect to the **animation clock of whatever causes it** (the hand's clip
time), not to a shot's progress. Then every camera — each film shot and the free
orbit — sees the same event at the same moment, which is what a user means by
"play the whole scene and let me record it from any angle". Freeze it when the
clip clamps, so the final state is a still you can orbit.
