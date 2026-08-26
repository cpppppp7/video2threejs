# Space and camera solving

## Coordinate conventions
- Two visible walls: left wall `x = LW`, right wall `z = RW`, corner at `(LW, RW)`; the room is open toward +x and +z (camera side).
- y up; floor y=0; ceiling 3.4; character height ≈1.55; mattress top 0.5–0.6.

## Solving the camera (never by feel)
1. Read the **horizontal fraction** of several landmarks in the reference frame (bookcase 0–16 %, window 16–34 %, monitor 40–55 %, corner 55 %, door 57–63 %, nightstand 95–100 % …).
2. Give each landmark a world position from the layout contract.
3. `python3 forge/solve_camera.py landmarks.json` grid-searches camera (x, z), heading and horizontal fov to minimise the fraction error; it prints CAM / LOOK / three.js fov.
4. Height and pitch: the horizon's height in the frame ≈ camera height; whether the ceiling line is in frame sets the pitch.
5. When the user finds a better view with OrbitControls, have them press `C` to copy the camera and paste it back; hard-code it.

## Reading rules
- Small angle between the left wall and the view direction → "looks head-on"; similar angles for both walls → "looking into the corner".
- Screenshot viewport must use the video's aspect ratio (16:9), otherwise comparisons are meaningless.
