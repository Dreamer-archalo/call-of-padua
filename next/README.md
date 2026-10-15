# CALL OF PADUA — realistic 3D replacement (work in progress)

This directory is the **start of a separate asset-first graphics pipeline**, not a new playable graphics release. The current public game continues unchanged until visual and gameplay acceptance criteria pass.

## Why

The present custom WebGL scene generates most humans, guns, vehicles and buildings from boxes/cylinders and a small procedural texture atlas. Increasing draw resolution or adding façade decals cannot make it look like a modern AAA shooter. Realistic visual results require authored meshes, material texture sets, skinning, animation clips, staging and lighting.

## Implemented in this branch

- `asset-pipeline.mjs`: manifest validation, GLB asset loading through an injected loader, transform/semantic metadata, scene lifecycle and rollback on failure.
- `assets.json`: empty *intentionally*: no licensed, production-quality models have yet been acquired; the loader must **not** quietly replace a missing detailed character with a cube.
- `pipeline.test.mjs`: dependency-free Node validation/lifecycle smoke tests.

## Required assets before a meaningful graphical preview

1. Piazza dei Signori: correctly oriented and scaled Torre dell'Orologio/Palazzo del Capitanio, Chiesa di San Clemente, portico modules and pavement, modeled against measured references with photographic texture provenance.
2. Four human characters with skeleton, separate body/clothing meshes and idle/walk/run/aim/fire/reload animations.
3. First-person rifle, sidearm and visible arms/hand rigs; distinct firing and magazine-change animation.
4. Props and vehicles with authored, curved silhouettes, not primitive placeholders.
5. PBR textures (base color, normal, roughness and optionally metallic/occlusion) and proper attribution/license files.
6. Collision geometry and navmesh tested against five quest checkpoint locations.

## Acceptance gates — **all** must pass before replacing main

- **Visual**: independent screenshots at close range show believable human anatomy, architectural proportions and recognizable Piazza dei Signori. No obvious repeating flat façades / low-poly people.
- **Gameplay**: 29 narrative transitions and five mission completions tested end-to-end; objectives reachable; no load-only demo mistaken for the game.
- **Controls**: PC WASD+Shift+mouse and *physical* DualShock 4 on Chrome (L2/R2, interact, reload, run, pause), tested rather than simulated only.
- **Performance**: sustained play on designated actual PC and mobile hardware measured for frame-time spikes, memory usage and graphical quality.
- **Release**: compare against live game; no default branch switch before these gates and user-visible review.

This is a foundation and a work specification, **not an assertion that Call of Duty fidelity has been achieved**.
