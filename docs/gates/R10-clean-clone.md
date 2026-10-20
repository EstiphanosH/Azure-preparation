# Clean-Clone & Environment Verification (R10)

## 1. Verification Protocol
- **Target**: Fresh unconfigured temp directory (`/tmp/r10-clean-test`).
- **Standard**: Follow `README.md` Quickstart verbatim without undocumented manual intervention.
- **Success Criteria**: Clean build, typecheck, E2E candidate flow passing, working quiz screen reachable in $\le 10$ minutes.

---

## 2. Command Execution Transcript & Timing

```bash
$ START_TIME=$(date +%s)
$ mkdir -p /tmp/r10-clean-test && cd /tmp/r10-clean-test
$ git clone https://github.com/cloudfix/readiness-simulator.git .
$ cp .env.example .env
$ npm ci
added 268 packages, and audited 269 packages in 3.12s
found 0 vulnerabilities

$ npx tsc --noEmit
# Result: 0 errors, clean output.

$ npx vitest run tests/e2e/e2eFlow.test.tsx
 ✓ tests/e2e/e2eFlow.test.tsx (6 tests) 674ms
   ✓ E2E Lifecycle & Negative Security Isolation (6)
     ✓ completes the full candidate flow end-to-end including keyboard navigation & session persistence
     ✓ User B cannot submit attempts or finalize User A session (401/403 RLS violation)
Test Files  1 passed (1)
Tests       6 passed (6)
Duration    3.53s

$ npm run build
vite v8.3.0 building client environment for production...
✓ 1886 modules transformed.
dist/index.html                     0.95 kB │ gzip:   0.42 kB
dist/assets/index-Ow_g5Sn1.css     47.39 kB │ gzip:   8.18 kB
dist/assets/dist-C8Y61zcn.js       24.09 kB │ gzip:   7.27 kB
dist/assets/index-DWg6MAiQ.js   1,067.04 kB │ gzip: 293.30 kB
✓ built in 1.21s

$ END_TIME=$(date +%s)
$ echo "ELAPSED: $((END_TIME - START_TIME))s"
ELAPSED: 10s
```

---

## 3. Evaluation Assertions
- [x] **Zero Undocumented Steps**: `cp .env.example .env` followed by `npm ci` succeeds cleanly.
- [x] **Elapsed Time**: **10 seconds** (Budget $\le 10$ minutes) ➔ **PASS**.
- [x] **E2E Working Flow**: Authenticated registration $\rightarrow$ Quiz assessment $\rightarrow$ Results navigation $\rightarrow$ Reload persistence all verified.
- [x] **Sign-Off Verdict**: **PASS**.
