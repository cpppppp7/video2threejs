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

For bodies, limbs, cloth and anything swept along a curve, read
`build/solid_geometry.md` first — winding, caps and seams decide whether the
object reads as solid at all, and they fail in ways that look like material bugs.

Principle: mass first, then proportions, then accessories. Any "texture instead of geometry" shortcut (a textured square for a duvet) gets spotted immediately.

## Close-up detail on a sculpted surface (hands, faces)

For a surface that will be seen in close-up, detail is displacement keyed to
recorded landmarks — never texture, and never a separate part:

| Feature | Recipe |
|---|---|
| Finger joint | palm side: **one** faint groove per joint (PIP, DIP), applied only where the normal faces the palm. Stacked lines and rings that wrap the sides read as scars. |
| Knuckle | dorsal side: a soft swell plus three very faint transverse wrinkles over it. |
| Nail | a U-shaped plate over the last third of the distal segment, **level with the skin**, defined by a fine nail-fold groove around it and a free-edge lip. A sunk plate reads as a pit — the user's word was "like a glans". |
| Palm creases | on a large flat area, every line reads as a ridge in close-up. On a statue, leave them out; keep only the thenar mound. |
| Finger-to-palm junction | a knuckle block extruded from all four roots **together**, plus mounds running from the palm into each finger and web fillets between the roots. Fingers extruded one by one leave slots down to the palm. |
| Palm-to-wrist | spread the thickness change over forearm → wrist → carpal → palm (~10° per step). One 31° step is the ridge across the heel of the hand. |

Two numbers worth keeping: a crease at 0.0035 H deep with σ 0.011 H is visible
and not a scar; a swell at 0.005–0.0065 H reads as bone under skin.
