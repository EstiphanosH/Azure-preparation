# ADR-003: Authentication and Authorization via PostgreSQL Row Level Security (RLS)

## Status
Accepted

## Context
A multi-user cloud readiness platform must guarantee strict tenant data isolation: candidates must never read or overwrite other candidates' active session patches, evaluation results, or draft audit records. We must determine whether authorization boundaries should reside in the application tier (e.g., Express middleware) or directly in the database engine.

## Decision
We mandate that **PostgreSQL Row Level Security (RLS)** is the **primary authorization boundary** of the entire architecture. Application-layer authorization checks may exist as an additive convenience (e.g. for client UI routing and preemptive button disabling), but they are **never primary**. Supabase Auth (GoTrue) issues signed JWTs with standard claims (`sub` = user UUID). PostgREST forwards this identity directly into the PostgreSQL execution session via `set_config('request.jwt.claim.sub', ...)`.

## Options Considered

| Option | Pros | Cons | Score (1-5) |
| :--- | :--- | :--- | :--- |
| **Option 1: Database-Native PostgreSQL RLS as Primary Authz (Chosen)** | Authorization cannot be bypassed by bugs in client code or application microservices; policies live alongside schemas; zero possibility of SQL query leaks returning cross-tenant rows. | Complex policies can introduce query planning overhead if indexes on `user_id` are omitted; local test fixtures require setting JWT context. | **5/5** |
| **Option 2: Application-Layer Middleware Authorization (Node/Express)** | Easy to write using simple TypeScript helper functions (`if (session.userId !== req.user.id) throw 403`); trivial to mock in unit tests. | Highly error-prone; a developer who forgets to attach the middleware to a new route creates an instantaneous data breach; bypassable via any alternative connection path. | **2/5** |
| **Option 3: API Gateway Policy Enforcement (Kong / AWS API Gateway)** | Centralized route-level regex policies; handles rate limiting and token verification before compute tier. | Gateway cannot inspect internal relational row ownership without making secondary database lookup roundtrips, multiplying latency. | **3/5** |

## Trade-offs & What We Lose (The Named Loser)
**The Loser: Application-Layer Middleware Authorization.**
By mandating PostgreSQL RLS as our primary boundary, we give up simple unit test mocking where an engineer could mock an Express `req.user` object to simulate arbitrary permissions. Instead, every automated test suite that touches data must either execute against a running PostgreSQL instance with proper session variables or verify policies through integration contracts.

## Consequences
- **Security Mandate**: RLS is enabled by default on 100% of tables (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY; ALTER TABLE ... FORCE ROW LEVEL SECURITY;`).
- **Policy Standard**:
  - `scenarios`: `CREATE POLICY "Allow public read access" ON scenarios FOR SELECT USING (true);`
  - `user_sessions`: `CREATE POLICY "Allow users to read and write own sessions" ON user_sessions FOR ALL USING (auth.uid() = user_id);`
  - `session_patches`: `CREATE POLICY "Allow users to access own patches" ON session_patches FOR ALL USING (auth.uid() = (SELECT user_id FROM user_sessions WHERE id = session_id));`
- **Additive App Layer**: The React UI uses auth status solely to toggle UI views, but relies entirely on RLS to deny unauthorized requests with HTTP 403 / empty result sets.
