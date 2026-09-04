# Skinning and joints that bend like a body

One sculpted skin, a small skeleton, and weights that make the limb a pair of
rigid segments joined by a short hinge. Everything here was paid for by a user
saying "the elbow is weird" three times.

## Weights: rigid segments, short joints

A capsule-distance weight lets every bone reach a full radius past its own end,
so half the upper arm blends with half the forearm and the limb bends like a
hose. The fix has two independent falloffs:

```js
const t  = dot(ap, ab) / |ab|²;                 // unclamped position along the bone
const dr = |ap - ab * clamp(t, 0, 1)|;          // radial distance to the axis
const w  = 1 / (1 + (dr / r)**6);               // flat inside the limb, falls fast outside
```

and, along the arm's own centre line (shoulder → elbow → wrist, signed from the
joint), a split between the two segments and the half-rotation joint bone:

```
up = 1 - S(-h, 0, u)      em = S(-h, 0, u) * (1 - S(0, h, u))      fo = S(0, h, u)
```

with **h ≈ 0.8 × the limb radius**, i.e. about **one limb diameter of blend in
total**. Too wide is a hose; too narrow and the two segments meet in a notch
with a flat facet in the crook. A vertex no bone reaches (a fingertip past the
last bone's end) must fall back to the nearest bone at weight 1 — normalising a
sum of near-zeros stretches it to infinity.

Paint the weights as vertex colours (`?diag=weights`) before believing any of
this. The band should read as a smooth symmetric gradient.

## Joint topology

Three loops **at** the joint — one just before, one on the joint, one just after
— and the outer two **fanned** a few degrees about the hinge axis so the rows sit
closer on the crook side (skin compresses there) and further apart over the
point (skin stretches). Check where the cage's loops actually are: ours sat
0.25–0.37 H *past* the skeleton's elbow, so the joint fell inside one long quad
and had nothing to bend with.

Add a **half-rotation bone** at the joint (`spine → up → elbowMid → fo → hand`),
oriented like the parent at bind and driven by `slerp(qParent, qChild, 0.5)`.
It keeps the volume that a two-bone chain pinches out.

## Anatomical axes — derive them, never assume

The wrist's **flexion axis is `forearm × palmNormal`**, not the elbow's hinge
axis. For a hanging arm those two are parallel to the palm normal, so a
"wrist flexion" key built on the elbow axis rotates the hand about its own
normal and changes the palm's facing by *nothing*. Symptom: the palm refuses to
lie flat on a surface no matter what you type. Proof, in one probe: sweep the
wrist angle ±30° and print `palmNormal · targetNormal` — ours stayed at 0.924
for every value.

Sign conventions are the same class of bug. Probe them at build time: rotate the
segment by a small positive angle and test which way it moved (`FLEX`, `ABD`
signs), rather than reasoning about handedness.

## IK for gesture keys

Pattern search over the joint angles is enough and stays interpretable:

- variables: shoulder flexion / abduction / rotation, elbow flexion, wrist
  flexion / deviation, each clamped to an anatomical range;
- cost: `|palm - target|² + w_n (1 - n·n_target) + w_f (1 - fingers·f_target) +
  small pull toward the authored seed`;
- for a palm that must lie **flat** on a surface, weight the normal term ~3× and
  restart the search from wrist-extended seeds (±45°); the flat solution needs a
  bent-back wrist that a seed-only search never reaches;
- solve keys **in order**, each seeded from the previous, so the whole gesture
  stays on one branch of the solution space.

Log every solve (`angles, palm error, normal alignment`). A 40-unit position
error with a 0.92 normal is not "close enough" — it is a different pose.

## Two timing traps

**Joint stagger vs. sampled poses.** Staggering the joints (hand lags the
shoulder by ~0.9 s) looks alive when the clip plays, but if a shot samples the
clip at a key's time, the shoulder has already left the key while the hand has
not arrived. Turn the stagger off for a clip whose poses are sampled by time.

**Monotonic gestures.** If a gesture is "the palm descends", measure each key's
distance to the target and check the sequence only decreases. A key that sits
farther out than the previous one reads on screen as the hand rising a second
time — which is exactly what a viewer will report.
