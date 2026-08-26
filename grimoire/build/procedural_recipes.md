# Object recipes (push each one to 8/10)

Per object: write the reference-feature list first, then compare a `?view=` close-up screenshot.

| Object | Recipe |
|---|---|
| Walls / floor / ceiling | box segments + planes; vertex colours on the floor for zones |
| Window | hole + white frame boxes + one mullion + blind box; no horizontal bar unless the video has one |
| Desk | long top box + legs; monitor (frame + CanvasTexture screen), PC tower (white box + blue rings), pen cups (cylinder + thin pens), paper, small boxes |
| Bookcase | **open structure** (back + sides + shelves + top); books as InstancedMesh with `setColorAt` and random heights; books lying on top as plain boxes (rotated instances glitch) |
| Drawer unit | white box + 3×3 coloured fronts + white handles |
| Bed frame | white platform box + thin RoundedBox mattress |
| Duvet | `duvetGeometry`: an 80×70 plane laid over the mattress — rolling hills inside (value noise ×0.5, fading toward the edges) + a rounded roll over the edge (R 0.17) + a short hang + both axes pulled in at the corners; DoubleSide sheen material |
| Pillows | RoundedBox 0.5 thick + noise puff + central dent, `rotation.x = -0.45` leaning on the headboard, CanvasTexture blue-splash pattern |
| Rug | CircleGeometry + CanvasTexture (blue, white dots, white edge), flat, no raised border |
| Poufs / floor pillow | RoundedBox + noise + sheen |
| Arc lamp | base disc + thin pole + half-torus arc + short drop + glowing sphere |
| Posters | plane + CanvasTexture (big letters / blue photo); count, rows and placement per contract |
| Plush toy | spheres (body / head / ears / arms) + a colour-patch face |
| Cat | RoundedBox trunk, white blaze / bib / gloves, pink inner ears, green slit-pupil eyes, whiskers, three-joint tail; a `sit` parameter blends sit/stand |

Principle: mass first, then proportions, then accessories. Any "texture instead of geometry" shortcut (a textured square for a duvet) gets spotted immediately.
