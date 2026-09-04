---
name: video2threejs
description: Rebuild a room/scene from a reference VIDEO (AI-generated or filmed) as a code-only procedural Three.js diorama, 1:1 in layout, color, light, objects, characters and their motion timeline. Use when the user shares a video/tweet and asks to rebuild/replicate it in three.js, or asks how to model a specific object (bedding, hair, lamps, rugs) procedurally. Built around live preview, multi-frame analysis, perspective solving, detail sculpting, research-when-unsure and screenshot-verified iteration.
---

# video2threejs — Video → procedural Three.js scene

Rebuild a reference video (Seedance / Sora / Veo output, or footage) as a **code-only, zero-asset** Three.js scene. The bar is 1:1: camera, every object's position and proportions, palette, light, character look, and the **motion timeline** the characters follow.

Reconstruction-by-code — not NeRF, not video-to-mesh, not downloaded asset packs. Sister skill of [img2threejs](https://github.com/img2threejs/img2threejs) (one object or character from one image); this skill covers a whole room with people and time.

This file is the always-loaded router. It holds the order of operations, the hard rules with their rationale, the definition of done, and the anti-patterns. The full contract for each stage lives in the `grimoire/` file the rule names — read it when you reach that stage, not before.

## When to use

- The user shares a video or a tweet with a video and asks to rebuild / replicate / "make this in three.js".
- The user asks how to model a specific soft or organic object procedurally (a duvet, pillows, a plush toy, anime hair, a cat).
- A room or interior needs to be reconstructed 1:1 from footage for a game, a diorama, an interactive homage.

Not for: a single hero object from a single image (use img2threejs), or projects where downloading GLB assets is acceptable.

## Required inputs

- The video (mp4 URL / tweet URL / file). If it is a tweet, fetch the media variants and download the 720p mp4.
- The user's tolerance: "1:1" (default for this skill) or "in the spirit of".
- A place to run a dev server that the user can open in a browser.

## Hard rules

Each rule below was paid for with a rework in the Blue Room case study. They are not stylistic preferences.

### 1. Live preview while sculpting
Start the dev server and `open` the page for the user **before** modelling anything. Write the scene in stages that hot-reload (walls → furniture → light → characters → motion → intro camera). Put a stage label in a page corner; route `window.onerror` into it so runtime errors are visible on the page.
*Why:* feedback is cheapest at the moment the wrong wall appears, not after the whole room is furnished around it.
→ `grimoire/build/live_preview.md`

### 2. Analyse the video first, from several angles
Extract at least 8 frames across the whole clip. For spatial facts (which wall, which corner, what sits on what) read a gridded frame cell by cell; confirm every fact in a second frame; if the perspective still will not resolve, ask the user to draw the corner and floor lines on a screenshot. Produce the spatial fact sheet, the object inventory, the palette, the character cards and the motion scene table **before** writing code.
Decide explicitly, per shot, **what moves — the subject or the camera**. Getting this backwards is expensive: a shot animated as a slow push turned out to be a static camera watching an arm rise, and the arm had no rig.
*Why:* three confident rebuilds put the window in the wrong place; one red-pen sketch fixed it.
→ `grimoire/intake/multi_view_analysis.md`, `grimoire/intake/frame_extraction.md`

### 3. Space before objects; solve the camera
Decide the visible walls and the corner, set the coordinate frame (left wall `x = LW`, right wall `z = RW`), then **solve** the camera from landmark fractions with `forge/solve_camera.py`. Only then place furniture.
Solve from measurements — landmark screen position **and** apparent size — with `forge/solve_camera.mjs`, and constrain the elevation so the solver cannot pick the wrong branch. Before chasing a framing, check it is possible at all: two shots of a composite reference often cannot coexist at one scale (triangle-inequality test in the grimoire). Say so, take the closest coherent framing, and move on.
*Why:* a camera placed by feel makes every later comparison lie; an impossible one makes it lie forever.
→ `grimoire/space/perspective_solving.md`

### 4. Keep a written layout contract
One line per object: wall, position, size, relationship, reference frame. Every user correction edits the contract first, then the code. The contract is the single source of truth for positions used by furniture, poses and the camera solver.
→ `grimoire/space/layout_contract.md`

### 5. Colours come from pixels
Sample lit and shaded patches of each object on the gridded frame; choose base colours between them, leaning bright. Never type a colour from memory.
→ `grimoire/intake/frame_extraction.md`

### 6. Real light, diagnosed, never painted
Solid walls with a real window opening; a roof that covers exactly the room interior; a toon ramp whose bottom step is zero; one warm sun with a shadow camera that covers the room. Never fake light with painted floor patches, volumetric planes or floating particles. Diagnose with a direct-sun-only render (`?diag=sun`): walls and ceiling must be black, patches must land where geometry says.
→ `grimoire/build/lighting.md`

### 7. Sculpt object by object to 8/10
Before building an object, list its reference features (shape, position, colour, accessories). After building, screenshot it from a close-up camera and score it. Do not move on below 8. Geometry over texture: a duvet is a draped sheet, a bookcase is open with real books, a pillow is thick and leans.
→ `grimoire/build/procedural_recipes.md`

### 8. One mesh, sculpted — never assembled

An organic form (a head, an ear, a torso, a limb, a hand, a robe) is **one closed
surface shaped by moving its own vertices**: bulge it out, sink it in, extrude a
limb from one of its faces, displace it with a smooth field. Do not build it from
a sphere plus a cone plus a capsule tucked together. Assembled organics produce,
every single time: a bright seam that moves with the light, an outline ring
around the buried part, a piece that detaches when a joint rotates, z-fighting
shimmer, a "transparent" look from one wrongly wound sub-mesh, and a shading
break no material tuning can remove.

**When it applies:** anything that shares skin in the reference must share a mesh
in the build — a nose *is* the face pushed forward, an ear *is* the skull raised.
Genuinely separate objects (a lamp, a book, a pole, a window frame) stay separate
primitives; small rigid solids that sit *on* a surface and never deform (hair
curls, rivets, blossoms) are instanced jewellery on the sculpted skin; long thin
runs are one swept tube, not a chain of capsules.

**Two substrates:** a displacement field on a dense subdivided primitive (heads,
near-spherical forms), or a box-modelling cage + Catmull-Clark, then displacement
for the detail (bodies, limbs, hands, clothing). Both leave one skin, which is
what the rig binds to.

*Why:* every assembled organic in this project's history was rebuilt as one mesh
in the end, after the seams had eaten a review round each.
→ `grimoire/build/one_mesh_sculpting.md`, `grimoire/build/box_modelling.md`

### 9. Reason first, then sculpt step by step, each step finished

Before touching geometry, write the form down: the base volume, which features
are raised, which are sunk, which are a change of slope, and in what order they
must be applied — each step is built on the surface the previous one left. Then
split the work into steps that each leave a **valid, checkable** surface (blank
base → large planes → primary features → secondary → fine detail), and **finish
each step before starting the next**: screenshot it, dump its numeric profile,
show it, get it accepted. A wobble left in step 2 is unfixable by step 5 because
five fields now sit on top of it. Never a step whose result can only be judged
after a later step lands.

*Why:* the head that was sculpted blob-by-blob was thrown away twice; the same
head sculpted as *blank face → recess → eyes → mouth → nose*, one sign-off per
arrow, was accepted.
→ `grimoire/build/one_mesh_sculpting.md`

### 10. Verify the surface with numbers, not with your eyes

Dump a profile across the surface — the centre line of a face, a lane across a
palm, a ring around a joint — and check it is monotonic where it should be.
A plateau between two rises reads to the eye as a dent, and a specular highlight
hides both. After any cage operation, also count the edges used by ≠ 2 faces:
non-zero means a T-junction, and subdivision will render it as a hard crease.
→ `grimoire/build/box_modelling.md`, `grimoire/build/one_mesh_sculpting.md`

### 11. Closed solids, correct winding, one surface where you can
A hand-built swept tube has two possible triangle orders and only one faces outward; the wrong one makes `FrontSide` cull the outer shell so you see the object's **inside** — the figure looks transparent and "badly stitched", and you will blame the material. `LatheGeometry` is an open tube. Joint balls must be larger than the tube ends they cap. Prefer one continuous profile (neck **and** torso in a single sweep) to two primitives tucked together: "far enough inside that it cannot show" stops being true as soon as their cross-sections differ or a joint rotates. Diagnose with `?diag=flat` (opaque material — still see-through means geometry), `?diag=norm`, then `?off=<part>`.
*Why:* several review rounds went into material tuning for a one-line index-order bug.
→ `grimoire/build/solid_geometry.md`

### 12. Shaders fail silently — wire up the error hook first
`renderer.debug.onShaderError` onto the page, before writing any custom material. A `ShaderMaterial` that fails to compile renders nothing and logs only to the console. Then know the quiet ones: `modelMatrix` exists only in the vertex stage; `pow(negative, 2.0)` and `smoothstep(hi, lo, x)` are **undefined** in GLSL and yield NaN; an integer hash that overflows to double before its bit ops is biased and flattens every texture in the scene; a fresnel cannot make an atmosphere when the camera skims the limb.
→ `grimoire/build/shader_traps.md`

### 13. Research when unsure
If a construction is unknown (cloth, hair, a lamp arc), search three.js examples, the forum and sibling skills, list up to three approaches, pick the most controllable, cite the source, and record the finding in `grimoire/research/when_unsure.md`. Verify maths with node (Euler order, geometry φ origins) rather than reasoning about it.
→ `grimoire/research/when_unsure.md`

### 14. Motion must look human
Root Euler order `YZX`; thigh negative = forward, calf positive = folds back; on the back `rx=-π/2`, prone adds `rz=π`, side adds `rz=±π/2`. A head's `rotation.x` is inverted from intuition — `Rx(+t)` looks **down**. Specify dramatic gestures as *palm here, facing that, fingers that way* and solve them with `forge/solve_ik_arm.mjs`, keying them **in sequence with a continuity term** so the poses stay on one branch and interpolate as a single movement. Waypoints (`via`) route characters around furniture. Sitting and lying heights are measured from the duvet top. Log joints and bounding boxes for any character that "vanishes". Screenshot every scene.
Bind the skin with **rigid segments and a short hinge** (one limb diameter of
blend, a half-rotation bone at the joint, cage loops fanned *on* the joint), and
**derive every joint axis** instead of assuming it — a wrist's flexion axis is
`forearm × palmNormal`, and building it on the elbow's hinge axis makes the key
do literally nothing. Effects the character causes belong to the clip's clock,
not to a shot's.
→ `grimoire/build/characters.md`, `grimoire/build/motion_timeline.md`, `grimoire/build/skinning_rig.md`

### 15. Screenshot everything, then self-review
Headless Chrome on the GPU path (seconds), viewport in the video's aspect ratio, `hstack` against the reference frame. Before handing off, write a scored self-review table with a gap list and let the user choose the next batch. "Improved" is not "done".
→ `grimoire/review/verification.md`, `grimoire/review/self_review.md`

### 16. The user's "no" list is permanent
Everything the user rejects goes into `grimoire/feedback/user_signals.md` and is never reintroduced (floating particles, painted light, Lego bedding, stringy hair, dog-like legs, light on walls …).
→ `grimoire/feedback/user_signals.md`

### 17. Deploy from the project root
`vercel --prod` (or any deploy) only from the project directory. Write the project `CLAUDE.md` with the coordinate frame, camera, palette, light, object facts, debug parameters and the user's lists.
→ `grimoire/review/handoff.md`

## Pipeline

| Stage | Do | Output | Read |
|---|---|---|---|
| 0 | Fetch the video, extract frames and a grid image | `frame_*.jpg`, `grid_01.jpg` | `intake/frame_extraction.md` |
| 1 | Multi-angle analysis | fact sheet, inventory, palette, character cards, scene table | `intake/multi_view_analysis.md` |
| 2 | Space: walls → frame → camera solve → layout contract | `landmarks.json`, `CAM/LOOK/fov`, contract | `space/*` |
| 3 | Scaffold with live preview; staged skeleton from the template | running page the user watches | `build/live_preview.md` |
| 4 | Light | window hole, roof, ramp, sun; `?diag=sun` clean | `build/lighting.md` |
| 5 | Objects one by one; organic forms as one sculpted mesh, step by step | per-object close-ups ≥8/10, profile dumps | `build/one_mesh_sculpting.md`, `build/box_modelling.md`, `build/procedural_recipes.md`, `build/solid_geometry.md`, `build/shader_traps.md` |
| 6 | Characters: sculpt → rig → weights → gesture keys → motion timeline | per-scene screenshots, weight map, IK log | `build/characters.md`, `build/skinning_rig.md`, `build/motion_timeline.md` |
| 6b | Volumetric effects (fire, storm, blast), keyed to the clip | orbit + in-shot screenshots | `build/volumetrics.md` |
| 7 | Camera UX: orbit, copy/persist, intro | `C`/`R`, intro shots verified | `build/camera_ux.md` |
| 8 | Verify and self-review; loop with the user | side-by-sides, scored table | `review/*` |
| 9 | Deploy and hand off | URL, project CLAUDE.md | `review/handoff.md` |

## Definition of done

- Side-by-side with the reference frame: walls, corner, window, bed, desk, posters, rug in the same places at the same proportions; camera solve error ≤ ~3 % of frame width.
- `?diag=sun`: only floor / intended surfaces lit; walls and ceiling black.
- Every object on the inventory built and scored ≥ 8; no object represented by a texture instead of geometry.
- Every scene of the motion table screenshot-verified: human poses, no clipping, correct heights.
- Self-review table delivered; project `CLAUDE.md` written; deployment URL returned.

## Anti-patterns (seen, banned)

- Building furniture before the walls and camera are settled.
- Placing the camera by feel; comparing a square screenshot with a 16:9 frame.
- A roof slab that extends outside the window (blocks the sun, hides the sky).
- A toon ramp with a non-zero floor under a strong sun ("the roof leaks light").
- Painted light patches, additive light planes, dust particles.
- RoundedBox slabs for bedding; textured squares for a duvet; white strips on top of the duvet.
- Ribbon / strand hair on distant characters; ponytails; full-sphere hair caps that swallow the face.
- Guessing Euler behaviour; XYZ order for lying poses.
- Screenshots through a shared browser; software-rasterised headless renders.
- Running the deploy command from a scratch directory.
- Blaming a material for see-through geometry (check winding and caps first).
- Trusting a hand-rolled hash without printing its min/mean/max.
- Adding close-up-grade procedural detail that destroys the same surface's large shapes at normal distance.
- Re-solving a framing the reference got by compositing.
- Hundreds of unlit billboards at high opacity — they saturate to one white blob.
- Assembling a head, ear, hand or body from separate primitives and hoping the
  seam hides; "far enough inside that it cannot show" is never true for long.
- Sculpting a form blob by blob with no written step order, or moving to the next
  step while the current one still wobbles.
- Judging a surface by eye under a specular highlight instead of dumping its
  profile; two gaussians handing over on a centre line (the plateau reads as a
  dent).
- A field keyed to one part applied with a hard distance cut — it writes a
  jagged seam onto the neighbour.
- An edge loop walked in one direction only (T-junction → hard crease after
  subdivision); a loop allowed to run out of its region and square off the body.
- Recording a landmark from a face index after later extrusions have reused it.
- Capsule-distance skin weights on a limb (rubber hose), or a near-rigid cut
  (notch and facet in the crook).
- Assuming a joint's rotation axis instead of deriving and probing it.
- One near plane for a whole film (long-lens shots z-fight and flicker).
- An effect written into one shot's `tick`, so the other angles show nothing.
- A modelled solid cap for an explosion; a handful of glowing shells with
  same-phase noise (concentric arcs).
- Heavy orbit damping and a slow zoom for a user who is recording by hand.

## Debug parameters the template provides

`?blank=1` base surface, every displacement field off · `?diag=zebra` striped environment (seams and slope breaks) · `?diag=clay` flat grey · `?diag=prof` numeric surface profile · `?diag=weights` skin weights as vertex colours · `?sub=<n>` subdivision level · `?t=<s>` jump the timeline · `?shot=N&u=0..1` freeze one shot at a fraction of its length · `?view=g1|g2|cat|desk|bed|rug` preset close-ups · `?view=free&cam=x,y,z&look=x,y,z&fov=` any camera · `?diag=sun` direct sun only · `?diag=flat` opaque material · `?diag=norm` normals · `?diag=pose` joint + bounding-box log · `?off=<part>,<part>` hide named meshes · `?pose=…` / `?key=<name>` dial a rig · `?intro=1&it=<s>` force / seek the intro. The page clock runs ≈2.5 s ahead of `?t` in headless renders.

## Install

```bash
git clone https://github.com/cpppppp7/video2threejs ~/video2threejs
ln -s ~/video2threejs ~/.claude/skills/video2threejs
```
