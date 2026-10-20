# Cross-Boundary Lifecycle & Data Isolation Verification (R10)

## 1. Scope & Invariants
Verify end-to-end data isolation, multi-tenant boundaries, and GDPR compliance across the UI, API Gateway, and Persistence tiers:
1. **Candidate Lifecycle**: Registration $\rightarrow$ Session Creation $\rightarrow$ Attempt Storage.
2. **Multi-Tenant Isolation (Anti-IDOR)**: User B's export query yields only User B's records; User A's sessions are invisible.
3. **GDPR Machine-Readable Export**: User A exports their full history including sessions and individual attempt metrics.
4. **GDPR Cascading Deletion**: User A triggers permanent deletion (`confirmation: 'DELETE_MY_ACCOUNT_PERMANENTLY'`), cascading across attempts, sessions, and user records.
5. **Post-Deletion Token Revocation**: User A's bearer token is immediately blacklisted; subsequent requests return HTTP 401 Unauthorized.

---

## 2. Full-Chain Execution Log

```bash
$ npx tsx /tmp/cross_boundary_test.ts
```

```text
=== STEP 1: Candidate A Registration & Session Creation ===
{"timestamp":"2026-10-20T08:28:54.770Z","level":"INFO","message":"Completed POST /api/auth/register with status 200","correlationId":"corr-mvgf8zfw-fvql","payload":{"durationMs":5.08,"statusCode":200}}
{"timestamp":"2026-10-20T08:28:54.775Z","level":"INFO","message":"Completed POST /api/quiz/sessions with status 200","correlationId":"corr-mvgf8zg3-lt43","payload":{"durationMs":4.17,"statusCode":200}}
{"timestamp":"2026-10-20T08:28:54.778Z","level":"INFO","message":"Completed POST /api/quiz/attempts with status 200","correlationId":"corr-mvgf8zg7-m32d","payload":{"durationMs":3.2,"statusCode":200}}
Candidate A registered (ID: usr-1792484934767-2zpzns), session created (sess-mvgf8zg4-394h), attempt recorded.

=== STEP 2: Candidate B Cross-Tenant IDOR Export Isolation ===
{"timestamp":"2026-10-20T08:28:54.779Z","level":"INFO","message":"Completed POST /api/auth/register with status 200","correlationId":"corr-mvgf8zgb-enqh","payload":{"durationMs":0.22,"statusCode":200}}
{"timestamp":"2026-10-20T08:28:54.782Z","level":"INFO","message":"Completed GET /api/user/export with status 200","correlationId":"corr-mvgf8zgb-3ezo","payload":{"durationMs":2.37,"statusCode":200}}
Candidate B export status: 200. Candidate B export email: cross_boundary_b_1792484934779@cloudfix.edu
Candidate B sees sessions: 0 (Expected: 0, A's session isolated).

=== STEP 3: Candidate A GDPR Export Verification ===
{"timestamp":"2026-10-20T08:28:54.783Z","level":"INFO","message":"Completed GET /api/user/export with status 200","correlationId":"corr-mvgf8zge-n0kd","payload":{"durationMs":1.57,"statusCode":200}}
Candidate A export status: 200. Sessions: 1, Attempts: 1

=== STEP 4: Candidate A Account Deletion Cascade ===
{"timestamp":"2026-10-20T08:28:54.785Z","level":"INFO","message":"Completed DELETE /api/user/account with status 200","correlationId":"corr-mvgf8zgg-svi5","payload":{"durationMs":1.29,"statusCode":200}}
Delete account status: 200. Deleted count: 3

=== STEP 5: Post-Deletion Token Invalidation & Data Inaccessibility ===
{"timestamp":"2026-10-20T08:28:54.786Z","level":"INFO","message":"Completed POST /api/quiz/sessions with status 401","correlationId":"corr-mvgf8zgh-vojn","payload":{"durationMs":0.58,"statusCode":401}}
Post-deletion session access status with deleted token: 401 (Expected: 401 Unauthorized)
```

---

## 3. Retention Policy & Cascade Verification
- **Automated Retention**: `supabase/migrations/20261019000002_retention.sql` purges attempts older than 90 days.
- **Cascading Hard Delete**: Deletion deletes attempts, sessions, and profile records atomically.
- **Session Revocation**: Bearer token added to blacklist set, neutralizing replay attempts.

**VERDICT: PASS**.
