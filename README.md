# PYTHONVERSE

Learn Python. Play. Build. Level Up.

A local React/TypeScript/Vite + FastAPI/SQLAlchemy application. This is an implemented learning preview, not a production release.

## Run on Windows in VS Code

Python 3.12+ and Node.js 22+ are required. This machine's working Python is `C:/Users/bbebi/AppData/Local/Python/bin/python.exe`; Windows Store aliases may fail.

From the project root in PowerShell:

```powershell
& C:/Users/bbebi/AppData/Local/Python/bin/python.exe -m venv backend/.venv
& ./backend/.venv/Scripts/python.exe -m pip install -r backend/requirements.txt
$env:JWT_SECRET = [Convert]::ToHexString([Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
cd backend
& ./.venv/Scripts/python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

Use a persistent private JWT_SECRET environment variable if sessions must survive API restarts. Never commit it. DATABASE_URL defaults to SQLite in the backend working directory. PostgreSQL uses `postgresql+psycopg://user:password@localhost/pythonverse`.

In a second terminal:

```powershell
cd frontend
npm ci
npm run dev
```

Open the local URL Vite prints. Register with a three-character username and a password of at least ten characters. Sign-in sessions stay in memory; sign in again after refreshing.

The default API proxy is port 8000. A local QA override currently exists in `frontend/.env.local` pointing to port 8001. Set `PYTHONVERSE_API_URL=http://127.0.0.1:8000` there for the commands above, or run the API on 8001. Local verification currently uses frontend port 5174 and API port 8001.

## Learning and playing

After login the dashboard shows saved checks, quiz XP, streak, badges and seven days of actual activity (Asia/Kolkata dates). Choose any of the 30 lessons across six worlds. Each has English/Tamil explanations, objectives, an example, a practice prompt and a server-graded knowledge check. First correct checks earn 20 quiz XP; retries do not increase XP.

Write Python in Monaco or expand the plain-text editor fallback. Run & test executes in a separate Pyodide Web Worker, compares actual output and runs additional behavior checks for selected variable/function/class missions. Load example, Reset, Clear, Copy and Stop are available. The worker is terminated after 30 seconds, including runtime loading. stdout and stderr are capped at 20,000 characters. Browsers do not provide a dependable per-worker memory quota; this is not a hardened hostile-code sandbox. Pyodide and Monaco runtime assets need an internet connection. Never execute user programs in FastAPI.

Adventure & battle opens the current day's Phaser scene. Six world palettes each contain five curriculum-linked levels. Use arrows/WASD or direction buttons to collect five crystals. Pass the current coding mission and reach the portal to save unranked adventure progress. The coding guardian can be attacked after passing the mission. Seven arcade exercises cover syntax, debugging, variables, loops, output, conditions and memory matching; they are introductory practice rounds, not full action games.

## Verification

From the project root:

```powershell
& ./backend/.venv/Scripts/python.exe -m pytest backend/tests -q
npm run build --prefix frontend
npm audit --prefix frontend
```

Tests cover authentication, validation, all 30 trusted example outputs and behavior checks, dashboard aggregation, repeat completion, game persistence and user isolation. Only trusted authored curriculum examples execute in the Python tests; API requests never execute submitted Python.

## Remaining release work

The full original brief is not complete. Admin content CRUD, migrations, guest accounts, complete challenge bank, competitive leaderboard, audio, settings persistence, sophisticated game art/obstacles/enemies, full boss progression, daily goals and production security/rate limiting remain. Knowledge checks are not a substitute for complete coding assessments. Browser-reported game results are unranked and never award competitive XP. Built-in seed synchronization currently updates authored lessons at startup; content editing requires a versioned seed/migration policy before admin authoring is added.

See docs/IMPLEMENTATION_PLAN.md and docs/VERIFICATION.md.

## Python-controlled game studio
The new code-driven studio appears above the account panel. Choose one of four acceptance demos or a Day 1–5 mission. On small screens switch between Game and Code. Write Python and click Run game code. For acceptance demo 2, first finish demo 1 then use Load door code (keep coins). Pause/Resume/Stop control the action queue; Reset world clears state. See docs/CODE_DRIVEN_ARCHITECTURE.md for architecture, limits and remaining work.
