# Placeholder Guide

This folder defines how to replace temporary placeholders with real assets.

## Characters (Drivers)
Format: One simple mesh per character, cosmetic only.
1) Driver1: small sphere color white
2) Driver2: small sphere color cyan
3) Driver3: small sphere color magenta
Replace with real models (.glb/.gltf). Keep pivot centered and facing +Z.
Store key in `store.selectedCharacter`.

## Cars
Format: Box geometry representing body.
Car names:
- Balanced
- Fast
- Tank
- Drift
Replace with real models. Match stats via `src/carStats.js`. Keep dimensions close to 1x0.5x2 for collisions or update radii accordingly.
Store key in `store.selectedCar`.

## Maps
Format: Plane with obstacles.
Replace with model or JSON layouts. Use `MapManager.loadMap` to integrate. Keep spawn points defined as Vector3 list.

## Effects
Weapons use simple meshes:
- GravityPulse: ring mesh
- SpeedOverdrive: stat buffs
- FlameTrail: plane quads
- MirrorShield: transparent sphere
- ShockMine: small sphere
Replace with optimized meshes or sprites as needed.
