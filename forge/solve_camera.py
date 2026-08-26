#!/usr/bin/env python3
"""Solve a camera (x, z, heading, hfov) from landmark horizontal positions in a video frame.

usage: solve_camera.py landmarks.json
landmarks.json: {"landmarks": [{"name": "corner", "x": -3, "z": -3, "frac": 0.55}, ...],
                 "aspect": 1.778, "y": 1.05, "search": {"x": [0, 8], "z": [0, 8]}}
frac = horizontal position in the frame (0 = left edge, 1 = right edge).
Prints CAM, LOOK (6 m ahead at camera height) and the vertical fov for three.js.
"""
import json, math, sys

def main(path):
    cfg = json.load(open(path))
    L = cfg["landmarks"]; aspect = cfg.get("aspect", 16 / 9); cy = cfg.get("y", 1.05)
    sx = cfg.get("search", {}).get("x", [-2, 10]); sz = cfg.get("search", {}).get("z", [-2, 10])
    best = None
    for hfov in [60, 65, 70, 75, 80, 85, 90, 95]:
        t = math.tan(math.radians(hfov / 2))
        for i in range(0, 41):
            cx = sx[0] + (sx[1] - sx[0]) * i / 40
            for j in range(0, 41):
                cz = sz[0] + (sz[1] - sz[0]) * j / 40
                angs = [math.atan2(l["z"] - cz, l["x"] - cx) for l in L]
                # heading = mean angle weighted to center the landmarks
                for h_i in range(0, 72):
                    h = -math.pi + h_i * math.pi / 36
                    err = 0.0
                    for a, l in zip(angs, L):
                        d = (a - h + math.pi) % (2 * math.pi) - math.pi
                        pred = 0.5 + math.tan(d) / (2 * t) if abs(d) < math.pi / 2 else 9
                        err += (pred - l["frac"]) ** 2
                    if best is None or err < best[0]:
                        best = (err, cx, cz, h, hfov)
    err, cx, cz, h, hfov = best
    vfov = 2 * math.degrees(math.atan(math.tan(math.radians(hfov / 2)) / aspect))
    lx, lz = cx + 6 * math.cos(h), cz + 6 * math.sin(h)
    print(f"rms error {math.sqrt(err / len(L)):.3f} (fraction of frame width)")
    print(f"CAM  = ({cx:.2f}, {cy:.2f}, {cz:.2f})   heading {math.degrees(h):.1f} deg   hfov {hfov} -> three.js fov {vfov:.1f}")
    print(f"LOOK = ({lx:.2f}, {cy:.2f}, {lz:.2f})")
    for a, l in zip([math.atan2(l["z"] - cz, l["x"] - cx) for l in L], L):
        d = (a - h + math.pi) % (2 * math.pi) - math.pi
        pred = 0.5 + math.tan(d) / (2 * math.tan(math.radians(hfov / 2)))
        print(f"  {l['name']:<14} observed {l['frac']:.2f}  predicted {pred:.2f}")

if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "landmarks.json")
