# API Contract Specification

## Architectural Invariants
1. **Zero Client Trust**: Every endpoint boundary validates request payloads through Zod `.strict()`. Unrecognized parameters trigger an instantaneous `422 Unprocessable Entity` or `400 Bad Request`.
2. **Safe Error Guarantee**: Errors are mapped via a centralized pure error transformer. Raw database stack traces, SQL syntax fragments, and internal identifiers are permanently redacted from HTTP responses.
3. **Database-Native Authorization**: Every data endpoint expects a verified Supabase JWT Bearer token and relies on PostgreSQL Row Level Security (RLS) as the primary authorization boundary.

---

## 1. Typed Error Union Model

Every API response failure adheres to one of six canonical error types:

```typescript
export type ApiError =
  | { readonly kind: 'AuthError'; readonly statusCode: 401; readonly message: string; readonly code: 'UNAUTHORIZED' | 'TOKEN_EXPIRED' | 'SESSION_REVOKED' }
  | { readonly kind: 'ValidationError'; readonly statusCode: 400; readonly message: string; readonly issues: readonly string[] }
  | { readonly kind: 'NotFoundError'; readonly statusCode: 404; readonly message: string; readonly resource: string }
  | { readonly kind: 'ConflictError'; readonly statusCode: 409; readonly message: string; readonly conflictKey: string }
  | { readonly kind: 'RateLimitError'; readonly statusCode: 429; readonly message: string; readonly retryAfterSeconds: number }
  | { readonly kind: 'InternalError'; readonly statusCode: 500; readonly message: 'An internal error occurred. Please try again.'; readonly incidentId: string };
```

---

## 2. Endpoint Operation Contracts

| HTTP Method & Route | Operation Name | Input Schema (`.strict()`) | Output Schema / Type | Allowed Error Codes | Latency Budget (p95) | RLS Context & Access Expectation |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`POST /api/auth/register`** | Register Candidate | `RegisterRequestSchema` | `AuthSessionResponse` | `400 (WeakPassword)`, `409 (EmailExists)`, `429 (RateLimit)` | **≤ 80 ms** | Public unauthenticated; inserts into `auth.users` & `profiles`. |
| **`POST /api/auth/login`** | Authenticate User | `LoginRequestSchema` | `AuthSessionResponse` | `401 (InvalidCredentials)`, `429 (RateLimit)` | **≤ 65 ms** | Public unauthenticated; issues JWT with claims. |
| **`POST /api/auth/refresh`** | Silent Token Refresh | `RefreshRequestSchema` | `AuthSessionResponse` | `401 (TokenExpired)`, `401 (SessionRevoked)` | **≤ 40 ms** | Single-flight queue; retried once on 401. |
| **`POST /api/auth/logout`** | Server-Side Logout | `LogoutRequestSchema` | `{ success: true }` | `401 (Unauthorized)` | **≤ 30 ms** | Authenticated; revokes active refresh token in database. |
| **`POST /api/quiz/sessions`** | Start Quiz Session | `StartSessionInputSchema` | `QuizSessionResponse` | `400 (BadDomain)`, `401 (Unauthorized)`, `429` | **≤ 65 ms** | Authenticated; RLS enforces `auth.uid() = user_id`. |
| **`POST /api/quiz/attempts`** | Submit Question Attempt | `SubmitAttemptInputSchema` | `AttemptResponse` | `400 (Validation)`, `401 (Unauthorized)`, `403 (RLS Deny)`, `404 (SessionNotFound)` | **≤ 45 ms** | Authenticated; RLS verifies parent session ownership (`auth.uid() = session.user_id`). |
| **`POST /api/quiz/sessions/:id/finalize`** | Finalize & Score Session | `FinalizeSessionInputSchema` | `FinalizeSessionResponse` | `400 (StateInvalid)`, `401 (Unauthorized)`, `403 (RLS Deny)`, `404` | **≤ 75 ms** | Authenticated; calls domain `scoreSession` and commits audit record. |
| **`GET /api/readiness`** | Compute Readiness Score | `GetReadinessQuerySchema` | `ReadinessScoreResponse` | `401 (Unauthorized)`, `500` | **≤ 60 ms** | Authenticated; aggregates attempts and computes weighted readiness. |
| **`GET /api/user/export`** | Export Candidate Data | `ExportDataQuerySchema` | `ExportDataResponse` | `401 (Unauthorized)` | **≤ 85 ms** | Authenticated; queries `v_candidate_export_data` where `user_id = auth.uid()`. |
| **`DELETE /api/user/account`** | Delete Account & Cascade | `DeleteAccountInputSchema` | `{ deleted: true, count: number }` | `401 (Unauthorized)`, `403` | **≤ 90 ms** | Authenticated; cascades deletion from `auth.users` to sessions and attempts. |
