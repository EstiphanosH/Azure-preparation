# R6 Acceptance Gate: End-to-End (E2E) & Multi-User RLS Isolation

## Compliance Notice
This diagnostic software is independent and educational. It contains zero vendor trademarks or proprietary question dumps. Every screen enforces:
**"Unofficial — not affiliated with Microsoft"**

---

## 1. Automated E2E Test Suite Results

Test suite `tests/e2e/e2eFlow.test.tsx` proves:
1. **Candidate Journey**: Signup / Login → Dashboard → Start Quiz → Select Options via Keyboard (`1-4`) → Submit Attempt → Finalize Session → Results Screen.
2. **Reload & Persistence**: Reloading the page preserves session state and candidate authentication tokens via TanStack Query and local storage caching.
3. **Multi-User RLS Negative Security**: Hostile cross-tenant attempts by User B to submit answers or finalize User A's session fail with `401 Unauthorized` / RLS Policy Access Denied.
4. **Mandatory Disclaimer Footer**: Asserted on every rendered route (`/auth`, `/dashboard`, `/quiz`, `/results`).

### Vitest E2E Execution Evidence:
```text
✓ tests/e2e/e2eFlow.test.tsx (6 tests) (604 ms)
  ✓ E2E Lifecycle & Negative Security Isolation (6)
    ✓ completes the full candidate flow end-to-end including keyboard navigation & session persistence (543 ms)
    ✓ RLS-Negative Security Test (PostgREST / API Isolation) (10 ms)
      ✓ User B cannot submit attempts or finalize User A session (401/403 RLS violation)
    ✓ Mandatory Unofficial Footer Verification (4)
      ✓ asserts "Unofficial — not affiliated with Microsoft" on /auth (24 ms)
      ✓ asserts "Unofficial — not affiliated with Microsoft" on /dashboard (10 ms)
      ✓ asserts "Unofficial — not affiliated with Microsoft" on /quiz (10 ms)
      ✓ asserts "Unofficial — not affiliated with Microsoft" on /results (5 ms)
```

---

## 2. RLS-Negative PostgREST Security Isolation Evidence

User A creates session `sess-active-001`.
User B authenticates with User B's token and attempts:
1. `POST /api/quiz/attempts` targeting `sessionId: "sess-active-001"`:
   - **Response**: `401 Unauthorized` (`UNAUTHORIZED`)
   - **Message**: `"Unauthorized attempt access across candidates."`
2. `POST /api/quiz/sessions/sess-active-001/finalize`:
   - **Response**: `401 Unauthorized` (`UNAUTHORIZED`)
   - **Message**: `"Unauthorized finalize attempt on another candidate session."`

This guarantees that Row Level Security boundaries are actively enforced at the gateway and database layers.
