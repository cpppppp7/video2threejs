# Layout contract (write it before placing anything)

One line per object: `name | wall | position (x,z) | size | relationship | reference frame`

Example (Blue Room):
- Window | left wall | z -0.95..2.15, y 1.05..3.05 | one vertical mullion, no horizontal bar, roller-blind box above | mid-wall, not in the corner | f01
- Desk | left wall | z -2.6..2.15 | ends at the window's left edge | monitor near the corner, PC tower beside it | f01
- Small bookcase | on the desk | z 0.75..2.1 | height 0.95 (half the window) | directly under the window's left pane, books lying on top | f03
- Drawer unit | under the desk | z 0.8..2.1 | 3×3 lavender fronts | below the bookcase | f01
- Door | right wall | x -2.45..-1.45 | | right beside the corner | f02
- Bed | right wall | x -1.33..0.63, z -3..-0.65 | head against the wall, body perpendicular | right beside the door | f04
- Four posters | right wall | x -0.88 / 0.18, y 2.9 / 1.85 | 2×2 | directly above the bed head, top row touching the ceiling | annotated frame
- Nightstand | right wall | x 1.0 | blue toy car on top | beside the bed head; a book stack on the floor in front | f01
- Arc lamp | bed-head corner | | arc bends right, lantern hangs over the pillows | | f01
- Rug | floor | (-1.2, 1.6) r 1.6 ellipse | blue with white dots, flat edge | front-left | f01

Rule: when the user corrects something, change this file first, then the code.
