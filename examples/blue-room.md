# Case: Blue Room (keshi "Life with a Cat", Seedance → Three.js)

Reference: https://x.com/keshiAIart/status/2091859315531681963 · Result: https://kami-no-michi.vercel.app/room.html

## Timeline (every mistake and its fix)
1. First version put the window on the back wall and the bed along the right wall. User: "the room is wrong, the window is mid-wall". → Lesson: multi-frame spatial analysis first.
2. The user drew the corner perspective in red on a screenshot → switched to a "looking into the corner" frame; camera solved from landmark fractions.
3. Bed: the user corrected item by item — head against the wall, body perpendicular, right beside the door, nightstand, book stack on the floor, posters 2×2 directly above. → The layout contract must be written per object.
4. Light: the user wanted "sun through the window, roof opaque, floor only, warm sunset". Two traps: the roof slab extended outside the window and blocked the sun; the toon ramp floor was not 0 and lit back-facing walls. Located with `?diag=sun`.
5. Duvet: textured square → RoundedBox tofu → noisy puff → **a high-resolution sheet draped over the mattress** (hills + edge roll + hang). User: "take a screenshot yourself" — screenshot every step.
6. Characters: ribbon locks / ponytail judged "ghost-like" → lathe helmet; the face hidden by the hair cap → cap ends at the brow; the "buns" were a SphereGeometry φ-origin misunderstanding; lying poses skewed → Euler order YZX; prone legs like a dog → positive calf values; side-lying facing the camera.
7. Screenshot tooling: a shared browser captured the user's tab → headless Chrome; swiftshader took 3 minutes → GPU path takes seconds.
8. Deploy accident: `vercel --prod` run in a scratch directory created a junk project → deleted immediately; deploy only from the project root.

## Final state (self-assessed)
Space/camera 9 · Light 8 · Bedding 7.5 · Desk area 8 · Cat 8 · Characters 7–8 · Motion 7 · Small props 7
