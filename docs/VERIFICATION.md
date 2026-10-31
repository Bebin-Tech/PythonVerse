# Verification record

## Automated checks

- Five API integration tests pass using the project Python 3.14 virtual environment.
- All 30 trusted authored lesson examples execute and match their expected output. Function/class/variable behavior assertions also pass.
- Registration, invalid credentials, protected APIs and duplicate usernames are tested.
- Incorrect knowledge checks do not save completion. Repeated correct checks do not duplicate progress or quiz XP.
- Dashboard next lesson, streak, weekly activity and XP aggregation are tested against persisted records.
- Adventure save validation, repeated saves and isolation between two users are tested. Adventure saves do not grant quiz XP.
- TypeScript and Vite production build pass. Phaser is loaded dynamically; its engine chunk remains approximately 1.7 MB before compression.
- npm audit reports zero vulnerabilities after overriding Monaco's transitive DOMPurify dependency to the patched release.

## Browser checks (31 October 2026)

Local frontend http://127.0.0.1:5174, API http://127.0.0.1:8001:

- Registered a local QA account and signed in again after reload.
- Opened Day 30 and switched to Tamil.
- Submitted a correct knowledge check; dashboard updated to 20 quiz XP, one check and a one-day streak. Values survived sign-out/reload/login.
- Monaco rendered successfully. Python example executed in Pyodide and produced Hello, Python!.
- Wrong output was rejected and left the battle attack locked.
- An infinite while loop was terminated at the 30-second timeout.
- Played the Phaser scene using direction controls, collected all five crystals, unlocked the portal by passing the code mission and received the saved-progress response.
- Attacked the coding guardian to zero health and observed victory.
- Syntax arcade round showed correct explanatory feedback.

Screenshot: adventure-verification.png.

## Limits

Only the first adventure scene was played end-to-end. The other world/day configurations build but have not each been played. The seven arcade rounds are introductory exercises; memory pairs and all other rounds still need exhaustive UI QA. Responsive mobile/tablet layouts and assistive-technology testing remain. Browser code results are untrusted and unranked. There is no reliable hard browser worker memory quota. Only selected missions have additional behavior assertions; others validate actual output. No production release or full-phase completion is claimed.
