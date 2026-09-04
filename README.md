<div align="center">

# video2threejs

**Turn a reference video into a living, code-only Three.js scene — 1:1.**

Layout · camera · palette · sunlight · every object · the characters · their motion timeline.
Rebuilt entirely in procedural code. No GLB, no textures on disk, no asset packs. Verified frame by frame against the video.

[![Version](https://img.shields.io/badge/version-0.1.0-green.svg)](CHANGELOG.md)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Runtime](https://img.shields.io/badge/runtime-Three.js-000000.svg)](https://threejs.org)
[![Agent skill](https://img.shields.io/badge/agent-Claude%20Code%20skill-7c3aed.svg)](SKILL.md)
[![Sister project](https://img.shields.io/badge/sister-img2threejs-orange.svg)](https://github.com/img2threejs/img2threejs)

*Live result of the first case study — keshi's "Life with a Cat" (a Seedance video) rebuilt as an interactive room:*
**https://kami-no-michi.vercel.app/room.html**

</div>

---

## Why this exists

Video models (Seedance, Sora, Veo, Kling …) can dream up a gorgeous room with two girls and a cat in thirty seconds. What they give you is pixels: no camera you can move, no objects you can touch, no light you can change, no character you can re-pose.

**video2threejs goes the other way.** It takes that video as a *reference* and reconstructs the scene as Three.js code you own: the walls have a real window hole the sun shines through, the duvet is a draped sheet with rolling hills, the girls are jointed rigs that sit, lie, stretch and play with the cat on a timeline read off the video, and the whole thing runs in a browser tab at 60 fps with an orbit camera.

It is a **method**, packaged as an agent skill (for Claude Code and similar agents), with the contracts, scripts and a reference implementation that make the method repeatable — plus a full record of the mistakes that shaped every rule.

> This is reconstruction-by-code. Not NeRF, not Gaussian splats, not video-to-mesh, not "find a similar model on Sketchfab". Everything is primitives, lathes, displaced planes, instanced meshes and canvas-painted textures.

## What "1:1" means here

| Dimension | Target | How it is checked |
|---|---|---|
| Space | same walls, same corner, same camera | landmarks' horizontal positions in the frame reproduced within ~2 % of frame width |
| Objects | every visible object, in its place, at its proportions | per-object reference-feature list + close-up screenshot, scored /10 |
| Colour | palette sampled from the video pixels | `forge/sample_colors.sh` on gridded frames |
| Light | sun through the real window, patches land where they land in the video | direct-sun-only diagnostic render (`?diag=sun`) |
| Characters | silhouette, hair mass, outfit, print, face | close-up screenshots vs frames |
| Motion | the same sequence of places and poses, human-looking | per-scene screenshots, joint logging |

## The method in one picture

```
video ──► frames (8+) ──► multi-angle analysis ──► layout contract ──► camera solve
                                                        │
       live preview (vite, staged, user watches) ◄──────┘
                │
       light ─► objects (one by one, to 8/10) ─► characters ─► motion timeline ─► intro camera
                │
       screenshot ─► side-by-side with the frame ─► self-review table ─► next batch
```

## Fifteen principles (each one was learned the hard way)

1. **Live preview while sculpting.** The dev server starts before the first mesh. The scene is written in stages that hot-reload, and the user watches it grow. Feedback arrives at the moment it is cheapest.
2. **Analyse the video from several angles before building.** Eight or more frames across the whole clip; gridded frames for spatial facts; a different frame whenever one is ambiguous. If the walls still will not resolve, ask the user to draw the perspective lines — it took one red-pen sketch to fix a layout that three "smart" rebuilds had gotten wrong.
3. **Space before objects.** Decide which walls are visible and where the corner is, set the coordinate frame, *solve* the camera from landmark positions (`forge/solve_camera.py`), and only then place furniture. A camera placed by feel is wrong by 20° every time.
4. **A written layout contract.** One line per object: wall, position, size, relationship to its neighbours, reference frame. User corrections edit the contract first, then the code.
5. **Colours come from pixels.** Sample lit and shaded patches on gridded frames; never type a colour from memory.
6. **Real light, not painted light.** Solid walls with a real window opening, a roof that covers exactly the room, a toon ramp whose bottom step is zero, a warm low sun. Debug with a direct-sun-only render, never by guessing. (Two of the three worst regressions in the case study were "light" bugs that were really a roof slab and a toon ramp.)
7. **Sculpt object by object to 8/10.** Each object gets a reference-feature list and a close-up camera. Tofu blocks, Lego bedding, textured squares standing in for geometry: fail.
8. **One mesh, sculpted — never assembled.** An organic form (head, ear, torso, limb, hand, robe) is one closed surface shaped by moving its own vertices: bulge it out, sink it in, extrude a limb from one of its faces, displace it with a smooth field. Primitives tucked together give you a moving seam, an outline ring, a part that detaches when a joint rotates, and a shading break no material can fix. Genuinely separate objects stay separate; small rigid solids that sit *on* the skin (hair curls, rivets) are instanced jewellery. Two substrates: a displacement field on a subdivided primitive, or a box-modelling cage + Catmull-Clark then displacement.
9. **Reason first, then sculpt step by step — and finish each step.** Write the form down before touching geometry (base volume, what is raised, what is sunk, in what order), split it into steps that each leave a checkable surface, and get each one accepted before starting the next. *Blank face → recess → eyes → mouth → nose* was accepted; the same head sculpted blob-by-blob was thrown away twice.
10. **Verify the surface with numbers.** Dump a profile — a face's centre line, a lane across a palm — and check it is monotonic where it should be; a plateau between two rises reads as a dent and a specular highlight hides both. After any cage operation, count the edges used by ≠ 2 faces: non-zero is a T-junction, and subdivision draws it as a crease.
11. **Closed solids, correct winding, one surface where you can.** A hand-built swept tube has two possible triangle orders and only one faces outward; the wrong one makes `FrontSide` cull the outer shell, so you see the object's inside and the figure looks transparent — for several review rounds you will blame the material. `LatheGeometry` is an open tube. Joint balls must be larger than the tube ends they cap. Prefer one continuous profile to two primitives tucked together.
12. **Shaders fail silently — wire up `renderer.debug.onShaderError` first.** A `ShaderMaterial` that will not compile renders nothing and logs only to the console. Then know the quiet ones: `modelMatrix` is vertex-stage only; `pow(negative, 2.0)` and `smoothstep(hi, lo, x)` are undefined GLSL; an integer hash that overflows to double before its bit ops is biased and flattens every texture in the scene.
13. **Research when unsure.** Official examples, the forum, sibling skills — then write the finding down in `grimoire/research/`. Verify maths with node instead of reasoning about it (Euler orders, geometry φ origins).
14. **Motion must look human.** One Euler convention (`YZX`), one joint convention, waypoints around furniture, a bounding-box log for characters that "vanish", a screenshot per scene. Limbs that *act* get a real joint chain, rigid-segment skin weights with about one limb diameter of blend, and **derived** joint axes — a wrist's flexion axis is `forearm × palmNormal`, and building it on the elbow's axis makes the key do nothing at all. Dramatic poses are solved from *palm here, facing that*, and effects the character causes are keyed to the clip's clock so every camera sees the same event.
15. **Screenshot everything, then self-review.** Headless Chrome on the GPU path renders in seconds; `hstack` against the frame; finish with a scored table of gaps and let the user pick the next batch. Never claim "done" for "improved".

## What is in the repository

```
video2threejs/
├── SKILL.md                 the agent skill: hard rules, pipeline, definition of done, anti-patterns
├── grimoire/                stage contracts, read when you reach the stage
│   ├── intake/              frame_extraction · multi_view_analysis
│   ├── space/               perspective_solving · layout_contract
│   ├── build/               live_preview · lighting · one_mesh_sculpting · box_modelling · procedural_recipes · solid_geometry · shader_traps · characters · skinning_rig · motion_timeline · volumetrics · camera_ux
│   ├── review/              verification · self_review · handoff
│   ├── research/            when_unsure (+ recorded findings)
│   └── feedback/            user_signals (what the user said yes / no to — permanent)
├── forge/                   scripts
│   ├── extract_frames.sh    ffmpeg frames + a red 80 px grid image
│   ├── sample_colors.sh     7×7 mean colour at grid coordinates
│   ├── solve_camera.py      camera (x, z, heading, fov) from landmark frame fractions
│   ├── solve_camera.mjs     general camera solve from two landmarks' screen position + apparent size
│   ├── solve_ik_arm.mjs     arm pose from palm position / palm normal / finger direction
│   ├── shot.sh              headless Chrome screenshot on the GPU path (seconds)
│   ├── compare.sh           side-by-side reference vs render
│   └── landmarks.example.json
├── templates/
│   ├── room.template.js     the Blue Room reference implementation (≈900 lines, everything below lives in it)
│   └── lib.js               toon ramp, value noise, radial textures
└── examples/               blue-room · golden-hour · palm-of-the-buddha · kami-buddha-sculpt — case studies with every mistake and its fix
```

### The reference implementation, feature by feature

- **Room shell**: four solid wall segments around a real window opening; a roof plane plus a shadow-casting slab that covers only the interior; a sky-gradient plane outside the window.
- **Light**: one warm DirectionalLight (sunset) through the window, hemisphere + shadowless fill, ACES tone mapping, 3072 shadow map, a toon ramp `[0,150,255]`.
- **Furniture recipes**: desk with monitor / PC tower / pen cups / papers; an open two-tier bookcase with 44 instanced books and six lying on top; a 3×3 lavender drawer unit; red-label file boxes; a bed with a thin mattress, a **draped duvet** (80×70 vertex sheet: rolling-hill noise inside, a rounded roll over the mattress edge, a short hang, corners pulled in), two patterned pillows leaning on a padded headboard; a nightstand with a toy car; a book stack; an arc lamp; a 2×2 poster set; a dotted rug; poufs; a plush bear; a door with panel lines; sticker cards on the walls.
- **Characters**: two jointed anime girls (hips / torso / head / shoulders / thighs / knees), oversized hoodies with canvas-painted skull prints, sclera + iris + pupil + highlight eyes, **lathe-turned bell-helmet hair** (long with side locks, and a chin-length bob with a straight fringe).
- **Cat**: tuxedo — rounded trunk, white blaze / bib / gloves, pink inner ears, green slit pupils, whiskers, three-joint tail; sit / stand / walk blend.
- **Motion**: an eight-scene table (chair → floor → stretch → kneel with the cat → pouf → crouch by the drawers → foreground → lounging with a phone), 1 s transitions, automatic walking between places, waypoints around the bed foot, per-scene overlays (waving, bouncing, kicking, phone nodding, tail).
- **Camera**: OrbitControls; `C` copies the camera, `R` resets, localStorage remembers the user's view; a cinematic intro (overview from the high inside corner → desk close-up → bed close-up → settle).
- **Debug URL parameters**: `?t=` (timeline), `?view=g1|g2|cat|desk|bed|rug`, `?view=free&cam=&look=`, `?diag=sun`, `?diag=pose`, `?intro=1&it=`.

## Quick start (with an agent)

```bash
git clone https://github.com/cpppppp7/video2threejs ~/video2threejs
ln -s ~/video2threejs ~/.claude/skills/video2threejs
```

Then, in Claude Code, share the video (or the tweet) and ask for a 1:1 rebuild. The skill loads itself and walks the pipeline: it will start a dev server and open the page, extract frames, ask you to confirm the walls if they are ambiguous, write the layout contract, and then build stage by stage while you watch.

## Quick start (by hand)

```bash
# 1. frames + grid
forge/extract_frames.sh clip.mp4 8 work/
# 2. colours (coordinates read off work/grid_01.jpg)
forge/sample_colors.sh work/frame_01.jpg duvet 820 420 rug 250 600 poster 1240 100
# 3. camera from landmark fractions
python3 forge/solve_camera.py forge/landmarks.example.json
# 4. copy the template into a vite project, iterate with the dev server open
# 5. verify
forge/shot.sh out.png "http://localhost:5173/room.html?t=6" 1600x808
forge/compare.sh work/frame_02.jpg out.png cmp.jpg
```

## Case study: Blue Room

Reference: [keshi, "Life with a Cat" part 3 (Seedance 2.5)](https://x.com/keshiAIart/status/2091859315531681963) — a white-and-blue teenage bedroom, two girls in skull hoodies, a tuxedo cat, sunset light through a big window, thirty seconds of idle life.

What it took: about 40 build–screenshot–compare iterations, 8 reference frames, one user-drawn perspective sketch, one Vercel deployment. The full timeline, including every misread and its fix, is in [`examples/blue-room.md`](examples/blue-room.md). Highlights of what went wrong and became a rule:

| What happened | Rule it produced |
|---|---|
| Window placed in the corner; bed laid along the wall | multi-frame spatial analysis; ask for red lines |
| Camera placed by feel, room looked "too slanted" | camera solved from landmark fractions |
| "Light leaking through the roof" | roof slab covers only the room; toon ramp floor = 0; `?diag=sun` |
| Duvet looked like tofu, then like a tablecloth | draped high-resolution sheet with hills, edge roll and hang |
| Hair locks "like a ghost", then two buns | lathe bell helmet; verify φ origins with node |
| Lying poses skewed; prone legs "like a dog" | Euler order YZX; calf sign convention; per-scene screenshots |
| A shared browser screenshotted the user's other tab | headless Chrome on the GPU path |
| `vercel --prod` run in a scratch folder | deploy from the project root only |

## Relationship to img2threejs

[img2threejs](https://github.com/img2threejs/img2threejs) reconstructs **one object or character from one image** with a gated sculpt pipeline. video2threejs sits above it: **a whole scene from a video**, with multiple characters and a timeline, where the unit of work is "a room that the user watches grow". When a single hero object needs more fidelity than a recipe gives, hand it to img2threejs and bring the result back.

## FAQ

**Why code instead of a mesh from a video-to-3D model?** Because a mesh is a dead end: you cannot re-pose the girl, move the lamp, change the hour of day, or fix a proportion without re-generating. Code is editable, tiny (one JS file), and animation-ready by construction.

**How close does it get?** In the case study: space and camera ≈9/10, light 8, bedding 7.5, desk area 8, cat 8, characters 7–8, motion 7. The remaining gap is mostly character finesse (hair layers, elbows) and small props.

**Does it need a GPU?** For the page, any WebGL browser. For verification screenshots, headless Chrome on the GPU path renders in seconds; the software rasteriser takes minutes.

**Can I use it for filmed video?** Yes — the pipeline does not care where the pixels came from. Multi-frame analysis is even easier with real footage.

## Roadmap

- Camera solve from vertical positions too (height and pitch), not only horizontal fractions.
- Automatic scene-table extraction (pose classification per frame) as a first draft for the motion timeline.
- Elbow and wrist joints; hand-held props (phone, pillow) parented to hands.
- A gallery of recipes beyond bedrooms: kitchens, cafés, streets.
- An `img2threejs` bridge: hero object → sculpt spec → drop-in factory.

## Contributing

Every rule in `SKILL.md` and every recipe in `grimoire/` is welcome to be challenged — with a screenshot. Add a case study under `examples/` with the reference link, the misreads, and the scores. Keep documents in English.

## License

MIT
