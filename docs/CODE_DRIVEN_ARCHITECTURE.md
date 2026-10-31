# Python-controlled game architecture

The new brief supersedes the earlier model where code only unlocked a separate activity.

1. Monaco sends Python source, supplied input and a snapshot of game state to a disposable Web Worker.
2. Pyodide loads game-api.py into that execution namespace. Its learner functions update a Python prediction and append JSON commands. They never generate JavaScript source.
3. Successful execution returns a bounded command list (maximum 300). Failed executions do not replay a partial list.
4. bridge.ts validates operation names and values. Phaser replays commands at 350 ms intervals; the React state panel reads the same reducer state used to draw the scene.
5. At the end, the renderer state must match the Python prediction. Mission checks inspect state, not code keywords.
6. Pause holds the queue. Stop terminates Python and cancels queued work. Reset starts the chosen mission again. Python execution has a 30-second timeout; stdout/stderr have an output cap.

This is deterministic batch execution followed by animated replay, not synchronous Python waiting on live physics. State queries inside a program read the same predicted sequential state that the renderer will reach. Learner code is untrusted, browser-only and not eligible for ranked rewards. Pyodide's Python standard environment is not a hostile-code security boundary or a per-worker memory quota.

## Implemented milestone

- Phaser 3 split game/editor view and mobile tabs.
- Four acceptance programs with actual Python execution and state-based checks.
- Game API: movement, jump animation, collection, conditional doors, key consumption, speed, attack, defend, wait, health/coin queries and print-to-sign.
- Code-driven Days 1–5 with English/Tamil instructions, editable unsolved starters and hints.
- Existing 30-lesson reading/check curriculum and account progress remain available below.

## Next milestones

Convert Days 6–30 to the new day ordering and game API, add true platform physics, obstacles/enemy interactions/checkpoints, integrate unranked mission persistence and unique rewards, build world unlocks, then admin/migrations/release hardening. The existing 30 lessons are not yet all Python-controlled game missions. No claim of full prompt completion is made.

## Tests (PowerShell)

From frontend, using Node.js 24 and the backend virtual environment:

```powershell
node --experimental-strip-types tests/bridge.test.mjs
npm run build
```

The bridge test executes trusted sample Python with the production API, then replays the returned commands through the production TypeScript reducer. It checks all four acceptance programs, the locked-door negative case, invalid command rejection, five working beginner solutions and five unsolved starters.
