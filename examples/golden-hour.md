# Case: Golden Hour (Danish Mir @DM_Arts_, Seedance, 8 s)

Reference: https://x.com/DM_Arts_/status/2092544200718025135 · Result: https://kami-no-michi.vercel.app/golden.html

An outdoor scene: sunset sky with cloud streaks, a hilltop meadow (grass, lavender, daisies), three dark stone steps, an orange Fiat-500 with a roof rack (guitar, suitcase, red bag), a girl in a purple wide-brim hat leaning on the rear bumper, a telephone pole with drooping wires, two houses, a pink blossom treeline, a dark branch canopy hanging into the top-right, falling leaves and a bird flock. Camera static with a slow push-in.

## What the build order looked like
1. Frames (10) + grid + pixel palette. 2. Sky dome shader (gradient + streak noise + sun glow), hill height field, steps, camera. 3. 60k instanced grass with a wind sway injected via `onBeforeCompile`, lavender spikes, daisies. 4. Car from an extruded side-profile `Shape` with bevel, proud window panels, cream roof, chrome, rack + luggage. 5. Houses (gable = two sloped boxes + triangular prism), pole + `TubeGeometry` wires, blob canopies, blossom line, far hills. 6. Girl (jointed groups, floral canvas shirt). 7. Leaves + birds instanced, breathing, push-in.

## Mistakes and fixes
- Camera too low/close: steps filled the frame — solved by moving the crest and car to ~9 m and the camera up.
- Trees filled the sky: the user sent two key frames — blossom line lowered/pushed back, canopy leaves made small and many, houses moved back and scaled.
- Gable roofs upside-down (ridge below eaves): rotation signs; fixed with a triangular gable prism.
- Car invisible for three rounds: a replaced line gained a trailing `//` comment that swallowed `scene.add(car)`. Found with bbox → forced-red → parent check → raycast.
- Car read as a red box: rebuilt from a real side profile; windows must be extruded wider than the bevelled body or they hide inside it.

## Self-assessment (first pass)
Sky 8 · meadow 7.5 · car 7.5 · girl 6.5 · houses 6.5 · trees/canopy 7 · light 7 · motion 7
