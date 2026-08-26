# Live preview while sculpting

1. Scaffold: `package.json` (vite + three) → `index.html` / `room.html` → `npm i` → `npx vite --port 5173 --strictPort` in the background → `open http://localhost:5173/room.html`.
2. Write in STAGES: walls/floor → furniture → light → characters → motion → intro camera. Each stage is one write that hot-reloads; a `#stage` label in a corner names the current stage.
3. Multiple pages: list every html in `vite.config.js` `rollupOptions.input`.
4. `curl localhost:5173/src/x.js` returning 200 only proves it compiles; **runtime errors need a screenshot or a `window.onerror` handler that prints into the stage label**.
5. The user's own browser tab is the acceptance surface; our screenshots are auxiliary. Be ready to match a screenshot the user sends back.
6. Debug URL parameters (built into the template): `?t=seconds` jump the timeline, `?view=g1|g2|cat|desk|bed|rug`, `?view=free&cam=x,y,z&look=x,y,z`, `?diag=sun`, `?diag=pose`, `?intro=1&it=seconds`.
