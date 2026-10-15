# CALL OF PADUA — Unity groundwork (not a playable release)

This is an **original Unity C# module**, isolated from the existing JavaScript game. It does not yet include Federico's map meshes, Unity scenes, textures, rigged actors, shooter combat or builds. It is not a copy of the Padova Open World Unity project.

### Implemented
- `DistrictWorld`: geographic polygon-based district lookup, player-zone access checks, faction ownership events and basic JSON persistence.
- `PatrolRoute`: Unity NavMesh patrols with stop intervals and animator speed.
- `WorldBoundaryGate`: in-world feedback for physical roadblocks at boundaries.
- `DistrictWorldTests`: EditMode tests for geometry, fail-closed movement and territory saves (**added but not yet run inside a Unity Editor**).

### World bounds: data still required
Playable districts: Centro Storico, Portello, Forcellini, Santa Rita, Madonna Pellegrina and Città Giardino. **Do not invent polygon vertices**: the component starts with an empty list and rejects access until real map geometries have been aligned with the Unity world's coordinate origin. Neighbouring areas should remain visible using distance-based LOD but have credible blocked entrances.

### Source candidate
Federico's `scandolo/padova-open-world` Unity 6.3/URP repository includes accurate building footprints and expansion assets. The public README does not grant a project-wide reusable license. Obtain explicit permission or license review **before** copying its code, city meshes, materials, animations or derivative assets into this separately owned game. Some map data and textures have documented permissive third-party licenses; evaluate individually and preserve attribution.

### Integration
1. Create a Unity 6.3 URP project (same Editor version if legally using a derivative).
2. Place these sources under `Assets/CallOfPadua/`.
3. Generate and verify district boundary polygons from licensed GIS and convert to matching Unity local X/Z coordinates.
4. Place `DistrictWorld` in a bootstrap scene, physical `WorldBoundaryGate` roadblocks on passable roads and NavMesh `PatrolRoute` components on patrol units.
5. Add proper first-person character rig, inverse kinematics, combat and vehicles as separate systems.
6. Run EditMode tests with Unity Test Framework, then real player tests including DualShock 4 and a full mission.

The published GitHub Pages version is unaffected.
