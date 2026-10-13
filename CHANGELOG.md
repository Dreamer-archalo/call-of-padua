# Changelog

## Alpha 0.6 — Combat & Animation

- Six weapon silhouettes: receivers, magazines, sights, handguards, optics, barrel details and suppressor-like muzzle geometry.
- Reload staged animation: remove/insert magazine, support hand follows and bolt cycles; weapon swap has a draw transition.
- Procedural muzzle flashes, shell ejection, spring recoil and hitmarker feedback. Synthetic layered shot sounds.
- Actors turn with their heading, shift weight, alternate footfalls and coordinate arm movement with actual speed. Idle breathing and aiming stance.
- Distance-based actor level-of-detail, quality settings High / experimental Ultra and automatic resolution step-down on persistent low frame rate.
- Preserves all five missions and save compatibility.

**Limits:** This is still procedural WebGL and cannot honestly be called AAA photorealism. Headless regression tests are not a substitute for real GPU or DualShock testing.


## Alpha 0.5 — Director Cut

- Mission-end reports with original dialogue, consequences and next-operation preview.
- Ambient survivor/radio dialogue tied to 10 mission checkpoints; no forced interruption of NPC conversations.
- Walking/exploration chapters subtly reduce crosshair prominence and introduce location narration.
- Unique atmosphere palette across campaign chapters (including fog color).
- Detailed procedural environmental props around Duomo, Ghetto, Signori, Erbe, Frutta, Pedrocchi and Santo integrated with existing WebGL culling.
- Rewritten dialogue focused on character motivations, losses and sense of place.
- Preserves established save key and existing core gameplay; no artificial timed chapter gating.

### Known limits

Prototype-grade procedural meshes are not photorealistic, Gamepad physical test and extended mobile soak test pending.