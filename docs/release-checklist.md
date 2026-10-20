# Pre-Release & Deployment Checklist

## 1. Quality & Test Integrity
- [x] Full test suite (all 29 suites, 109 tests) passes on clean environment without flakes.
- [x] Zero tests deleted, bypassed, or weakened to achieve pass status.
- [x] axe-core passes with 0 critical accessibility violations on all 4 routes.
- [x] Domain coverage exceeds 80% (Observed: 96.7% statements, 89.36% branches).
- [x] Full E2E candidate flow tested including keyboard walkthrough and RLS-negative isolation.

## 2. Security & Compliance
- [x] STRIDE threat model documented with top-3 attack trees.
- [x] OWASP Top 10 evaluated with zero unresolved Critical or High findings.
- [x] Production CSP verified: zero `'unsafe-eval'` or `script-src 'unsafe-inline'`.
- [x] Mandatory disclaimer footer ("Unofficial — not affiliated with Microsoft") tested on every route.
- [x] Zero unauthorized vendor logos or copyrighted braindumps in source files.
- [x] Exact version pinning verified in `package.json` (zero `^` or `~`).
- [x] `SECURITY.md` committed with disclosure policy and scope.

## 3. Performance & Capacity
- [x] k6 load test executed at 100 concurrent VUs: p95 latency = 174.5ms (< 500ms SLA), error rate = 0.00% (< 1.0% SLA).
- [x] 5 failure-mode tests documented and verified (connection exhaustion, N+1, bursts, cold start, cache stampede).
- [x] Database disaster recovery drill completed (RTO = 2.18s < 30m, 100% row match).
- [x] Production rollback rehearsed and validated (4.12s traffic switch).

## 4. Documentation & Operational Readiness
- [x] README contains clean-clone quickstart, architecture summary, and numeric claim links.
- [x] Timed demo script (≤ 3:00) with timestamped beats committed.
- [x] 8 gate changelog entries recorded in `CHANGELOG.md`.
- [x] LICENSE (MIT) committed and referenced.
