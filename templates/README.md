# templates
- `room.template.js` — the Blue Room reference implementation (imports `./lib.js` for the toon ramp + value noise). Copy both into `src/`, rename the scene, then replace layout/palette/poses via the grimoire contracts. Everything the skill talks about (solid walls + window hole, roof, sunset sun, GRAD2 ramp, duvetGeometry, pose rig with YZX order, sequencer with `via`, intro camera, debug URL params) lives here.
- `lib.js` — `GRAD`, `vn` (value noise), `radialTex` helpers.
