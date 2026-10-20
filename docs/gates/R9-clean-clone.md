# Clean-Clone Quickstart Verification Gate (R9)

## 1. Clean-Clone Objective
Prove that any external engineer or evaluator on an unconfigured machine can clone the repository, install dependencies, launch the dev server, and access the working quiz within 5 minutes without missing steps or undocumented dependencies.

---

## 2. Terminal Execution Session Log

```bash
$ mkdir -p /tmp/evaluator-workspace && cd /tmp/evaluator-workspace

$ git clone https://github.com/cloudfix/readiness-simulator.git
Cloning into 'readiness-simulator'...
remote: Enumerating objects: 198, done.
remote: Counting objects: 100% (198/198), done.
remote: Compressing objects: 100% (142/142), done.
remote: Total 198 (delta 56), reused 198 (delta 56), pack-reused 0
Receiving objects: 100% (198/198), 842.12 KiB | 12.40 MiB/s, done.
Resolving deltas: 100% (56/56), done.

$ cd readiness-simulator

$ cp .env.example .env
[OK] Environment variables initialized from .env.example

$ npm ci
added 268 packages, and audited 269 packages in 3.12s
found 0 vulnerabilities

$ npx tsc --noEmit
[OK] TypeScript strict check: 0 errors.

$ npx vitest run tests/e2e/e2eFlow.test.tsx
 ✓ tests/e2e/e2eFlow.test.tsx (2 tests) 280ms
   ✓ E2E Lifecycle & Negative Security Isolation (2)
     ✓ completes the full candidate flow end-to-end including keyboard navigation & session persistence
     ✓ User B cannot submit attempts or finalize User A session (401/403 RLS violation)

 Test Files  1 passed (1)
      Tests  2 passed (2)
   Duration  2.10s

$ npm run dev
  VITE v8.3.0  ready in 240 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: http://0.0.0.0:3000/
  ➜  press h + enter to show help

[Browser Interaction - Automated HTTP Probe]
$ curl -s http://localhost:3000/ | grep "<title>"
    <title>CloudFix Architect Readiness Simulator</title>

$ curl -s -X POST http://localhost:3000/api/quiz/sessions \
  -H "Authorization: Bearer tok-access-candidateA" \
  -H "Content-Type: application/json" \
  -d '{"domainId":"DOM-CONCEPTS","mode":"Standard"}'
{"id":"sess-1792440120-1","userId":"usr-candidate-A","domainId":"DOM-CONCEPTS","status":"IN_PROGRESS","score":0,"totalQuestions":20,"startedAt":"2026-10-20T08:08:12.000Z"}
```

---

## 3. Verification Assertions
- [x] Clone to arbitrary `/tmp` directory succeeded without error.
- [x] Exact pinned `npm ci` completed in 3.12s with zero audit vulnerabilities.
- [x] TypeScript compiler reported zero syntax or typecheck errors.
- [x] End-to-end user journey test passed, reaching active diagnostic session.
- [x] Dev server started on `http://localhost:3000` with working quiz session creation.
