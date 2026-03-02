Crash the Karts – 3D Kart Combat
================================

Overview
--------
High‑speed arcade kart combat built with Three.js and Vite. Features:
- Fast drift handling and camera tilt
- Mystery boxes with strong arcade weapons
- Car‑to‑car sphere collision with bounce and high‑speed damage only
- Intelligent bots that seek boxes, attack, evade, and recover
- Garage with live GLB car & character preview and color customization
- Modular loaders with GLB path validation and fallbacks

Run
---
- Install: `npm install`
- Dev: `npm run dev` (hot reload)
- Build: `npm run build`
- Preview build: `npm run preview`

Assets
------
Place GLB files here (already wired):
- Cars: `placeholder/cars/*.glb`
- Characters: `placeholder/charaters/*.glb` (intentional spelling)
The app discovers all GLBs automatically and lists them in the Garage.

Tech
----
- Three.js (renderer, scene, GLTFLoader)
- Vite (dev + bundling)
- Vanilla JS modules

Notes
-----
If a GLB fails to load, the loader logs a clear console warning and renders a fallback mesh so the app remains usable.
