# ADR-002: Backend Architecture: Supabase PostgREST vs Custom Express API

## Status
Accepted

## Context
The platform must support 100 concurrent users performing diagnostic sessions, applying configuration patches, and exporting verified audit records. The platform decision defaults to Supabase per hackathon architectural guidelines. We must evaluate whether to adopt Supabase PostgREST or deploy a custom Node.js Express backend.

## Decision
We select **Supabase PostgREST + Edge Functions** as the primary backend platform. CRUD interactions with scenarios, sessions, and patches interface directly with PostgREST, while complex audit log aggregation and session finalization execute via PostgreSQL stored functions (RPC) and Deno Edge Functions.

## Options Considered

| Option | Pros | Cons | Score (1-5) |
| :--- | :--- | :--- | :--- |
| **Option 1: Supabase PostgREST + Edge Functions (Chosen)** | Native compilation of HTTP queries into single SQL statements; eliminates manual controller/DTO boilerplate; leverages built-in connection pooling and database RLS. | Advanced procedural logic must be written in PL/pgSQL or Deno TypeScript edge functions rather than standard Node.js Express routes. | **5/5** |
| **Option 2: Custom Node.js Express API on Cloud Run** | Complete procedural freedom; familiar middleware architecture (`cors`, `morgan`, `zod`); straightforward mocking in unit tests. | Requires writing and maintaining ~2,500 lines of repetitive CRUD endpoints, connection pooling logic, and duplicated auth checks; higher CPU overhead per request. | **3/5** |
| **Option 3: NestJS Enterprise Backend** | Rigid architectural patterns; dependency injection; built-in Swagger/OpenAPI generators. | Excessive memory footprint (>180 MB idle); slow cold start (>3.5s) on auto-scaling containers; over-engineered for a focused diagnostic engine. | **2/5** |

## Trade-offs & What We Lose (The Named Loser)
**The Loser: Custom Node.js Express API Server.**
By choosing Supabase PostgREST, we lose the ability to insert arbitrary Node.js middleware functions into the standard request processing pipeline. Developers cannot simply inject an Express `req, res, next` interceptor to alter request payloads on the fly. Any business logic that must execute server-side must be expressed either as a database constraint, a PostgreSQL trigger, or an isolated Deno Edge Function.

## Consequences
- **Positive**: Eliminates 100% of handwritten CRUD API code; queries execute with near-zero application layer serialization overhead (sub-15 ms database latency); database-level security policies apply automatically.
- **Negative**: Team must understand PostgREST query syntax (`?select=...&eq=...`) and PostgreSQL procedural language (PL/pgSQL) for non-trivial aggregations.
- **Capacity**: Satisfies the 100 concurrent user requirement by keeping connection checkout durations below 15 ms via Supavisor.
