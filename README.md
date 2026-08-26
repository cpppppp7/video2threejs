# video2threejs

**Rebuild the room in a reference video as a code-only, procedural Three.js diorama — 1:1.**

Layout, camera, palette, sunlight, every object, the characters and their motion timeline — all reconstructed by code (no GLB, no textures on disk), verified frame-by-frame against the video.

Sister project of [img2threejs](https://github.com/img2threejs/img2threejs) (single object/character). This one covers whole scenes with people and time.

## What's inside

- `SKILL.md` — the agent skill (router + hard rules). Symlink it into `~/.claude/skills/`.
- `grimoire/` — stage contracts: intake, space/perspective, build recipes, lighting, characters, review, research, user feedback.
- `forge/` — scripts: frame extraction + grid, pixel color sampling, camera solving from landmark x-positions, headless GPU screenshots, side-by-side compare.
- `templates/room.template.js` — a starting scaffold (toon ramp, solid walls with a window hole, roof, sun, debug URL params, pose rig + sequencer, intro camera).
- `examples/blue-room.md` — the first case study (keshi's "Life with a Cat", Seedance) with every mistake and its fix.

## The five things that matter most

1. **Live preview while sculpting** — dev server first, stages hot-reloaded, user watches.
2. **Multi-frame, multi-angle analysis** — never trust one frame for spatial facts.
3. **Space before objects** — walls/corner → coordinate frame → camera solved from landmark positions.
4. **Detail sculpting per object to "8/10"**, verified with close-up screenshots.
5. **Research when unsure** — official examples, forums, sibling skills — write the finding down.

License: MIT
