# Motion timeline (from video to scene table)

1. After frame extraction, write the scene table by time: `t | person A place + pose | person B place + pose | cat`.
2. Map every scene to `PA[i] / PB[i] / PC[i]` pose parameters; places come from the layout contract.
3. Transitions: `k = smoothstep(0, 1, phase)`, angles interpolated along the shortest arc; large position changes walk; getting on/off the bed goes through `via`.
4. Add per-scene overlays (waving, bouncing, kicking, phone nodding, cat tail) with amplitudes big enough to read.
5. Verify: screenshot every scene at `?t = scene start + 2` from at least three cameras.

## World effects vs shot effects

Anything the character *causes* — an explosion, a shockwave, a light — belongs to
the world and must be a function of the **clip's time**, not of a shot's
progress. Put it in one `worldFX(clipTime)` called every frame, from the film and
from the free orbit alike. Then a shot that watches the descent shows the fire
already spreading, the shot after it continues the same fire, and a user
orbiting freely sees exactly what the film saw. Effects written into a shot's
`tick` exist only in that shot, and the user will immediately ask why the
previous angle had no explosion.

## Slow motion

A shot plays slowly by mapping its own progress to a **short window of clip
time** (`timeFn: (u) => lerp(t0, t1, u)`), not by slowing the whole clip. Pick
the window from what the effect is doing: "the shot covers the eruption from a
quarter to a third grown" is a window, and it survives later retiming of the
gesture because you re-derive it from the effect's clock.

## Ignition timing

When an effect is triggered by a gesture, state *where in the gesture* it
starts, and check it on screen. "It starts when the hand reaches the top" versus
"after the palm has pushed some way down" is a one-constant change and a
completely different beat.
