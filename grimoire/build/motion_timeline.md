# Motion timeline (from video to scene table)

1. After frame extraction, write the scene table by time: `t | person A place + pose | person B place + pose | cat`.
2. Map every scene to `PA[i] / PB[i] / PC[i]` pose parameters; places come from the layout contract.
3. Transitions: `k = smoothstep(0, 1, phase)`, angles interpolated along the shortest arc; large position changes walk; getting on/off the bed goes through `via`.
4. Add per-scene overlays (waving, bouncing, kicking, phone nodding, cat tail) with amplitudes big enough to read.
5. Verify: screenshot every scene at `?t = scene start + 2` from at least three cameras.
