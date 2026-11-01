# Playable prototype: three-quest campaign

This milestone adds a complete short campaign to the code-controlled studio. It remains a prototype rather than the full 30-day game.

- Crystal Crossing: collect coins at tiles 1 and 3, avoid spikes at tile 3, obtain the key at tile 4, unlock the door at tile 7 and reach tile 8.
- Guardian Gate: navigate the same hazards, then defeat a 100-HP guardian at tile 6. Attack only from an adjacent tile.
- Python Boss: defeat a stronger 150-HP boss and reach the exit.

The character is controlled exclusively by learner Python. jump() advances one tile over spikes; walking onto spikes removes 25 health and restores the checkpoint position. Tile 2 activates the checkpoint. Enemies block movement and damage the player on contact; defend() reduces the next contact damage. Attacks scale with set_speed(1–10). A dead player cannot move or attack. Reset world restores the current quest. The next quest unlocks only after the current outcome passes.

Quest completion is stored locally under pythonverse-prototype-v1. This is browser-local prototype progression, not ranked XP or account/database progress. New adventure clears the prototype progression and starts Quest 1 with its unsolved starter. Existing lessons and demo programs remain available.

## Verification

The production Python API and TypeScript reducer agree on all three campaign solutions. Tests also verify spike damage, checkpoint restoration, death, enemy blocking and all previous acceptance programs. Production build passes; Phaser remains a large lazy-loaded engine chunk.

## Play

Open http://127.0.0.1:5174/. The prototype starts at Crystal Crossing without requiring login. Read the numbered tiles and mission, edit the starter in Code, click Run game code and watch Game. On wide screens the editor and game appear together. Expand Mission hint for guidance. Programs continue from the current state, so you can solve the route incrementally. Use Reset world for a fresh attempt.

The world uses deterministic tile-based rules and animated jumps, not continuous platform physics. Advanced art, more routes, richer enemy behavior and cross-device campaign saves remain future work.
