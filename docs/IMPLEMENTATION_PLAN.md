# PYTHONVERSE implementation plan

Build locally using React/TypeScript/Vite and FastAPI/SQLAlchemy. No existing files were present.

1. Foundation: project configuration, authentication, persistent users, secure passwords, JWT, design shell. Verify API auth and production frontend build.
2. Curriculum: author and review 30 bilingual lessons, exercises and quizzes; seed relational content; implement dashboard and progression.
3. Execution: Monaco and isolated Pyodide worker with timeout, output limits and behavioral tests. Verify successful, failing and infinite-loop programs.
4. Adventure: Phaser movement, six worlds, collectibles and curriculum-gated puzzles; save progress through API.
5. Rewards and games: transactional unique rewards, streaks, battles and eight educational mini games. Verify replay cannot duplicate XP.
6. Administration: role-guarded content CRUD, statistics, profiles and leaderboard using persisted records.
7. Release: migrations, integration and browser tests, accessibility, responsive QA, deployment configuration and Windows guide.

## Acceptance gates
No feature is complete until its implementation and relevant tests pass. Browser code execution results are untrusted for competitive rankings; authoritative verification requires a separate sandbox service, never the API process. Production requires an explicit JWT secret, HTTPS and reviewed infrastructure limits.

## Current status
Foundation in progress. All later phases pending. Python executable availability must be resolved for backend verification.

## Verification update
Python 3.14 found at C:/Users/bbebi/AppData/Local/Python/bin/python.exe. Workspace virtual environment and npm dependencies installed. Frontend production build passes. Pyodide worker playground implemented; browser execution not yet verified. Phase 1 remains open pending security hardening and browser QA. Later phases remain pending.

## Curriculum increment
Implemented days 1–5 with English/Tamil explanations, executable examples, practice prompts and server-graded knowledge checks. Lessons seed into SQLite/PostgreSQL tables; authenticated completion persists with a unique user/lesson constraint. Learning path UI includes language switching and actual saved check counts. No XP is granted for unverified browser code. Verified: frontend production build and three API integration tests pass. Remaining Phase 2 work: days 6–30, full objectives/assessments and dashboard. Browser QA remains pending.

## Integrated curriculum, dashboard, editor and adventure increment

Implemented all 30 bilingual lessons with authored explanations, executable examples, objectives, practice prompts and knowledge checks. Dashboard derives quiz XP, streak, badges, next lesson and weekly activity from database progress. Monaco and Pyodide worker include output validation and selected behavior assertions; reset/copy/clear/example/stop controls work. Added six world/day configurations in Phaser, movement, crystals, curriculum-gated portal saves, basic coding guardian health/victory and seven introductory arcade rounds.

Verified: five integration tests, all trusted curriculum examples/behavior assertions, production build, dependency audit and browser learning/editor/adventure happy path plus wrong-output and infinite-loop paths. See VERIFICATION.md.

Phase 2 core learning path and dashboard are implemented and tested at this scope; full original daily assessments/content depth and dashboard daily challenges/goals remain. Phases 3–5 have a working integrated baseline, not a complete game. Phase 1 production hardening and phases 6–7 remain open. Admin CRUD, migrations, rate limits, full world art/obstacles/enemies, richer battles, ranked validation, sound and complete settings remain.

## Revised code-driven brief
The attached master prompt supersedes the prior game gate design. Architecture is recorded in CODE_DRIVEN_ARCHITECTURE.md. Implemented a whitelisted Python-to-JSON-to-Phaser 3 command queue, prediction/replay agreement, pause/resume/stop/reset, bilingual first-five-day code missions, responsive split view and four acceptance demos. This is a new staged milestone; Days 6–30 have not yet been converted to code-driven missions. Existing learning content and accounts remain.
