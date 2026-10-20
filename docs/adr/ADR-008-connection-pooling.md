# ADR-008: Database Connection Pooling: Supavisor vs pgBouncer vs Direct Connections

## Status
Accepted

## Context
Under a target concurrent load of 100 active users, client requests generate up to 100 requests per second with brief 2.5× burst spikes. Spawning a new PostgreSQL server process for each incoming HTTP request consumes ~5-10 MB of RAM per connection, introduces a 30-50 ms TCP/TLS handshake penalty, and risks exhausting PostgreSQL's `max_connections` ceiling (typically 60 on standard managed tiers). We must establish a connection pooling strategy that bounds database resource consumption.

## Decision
We select **Supavisor in Transaction Mode** (the default Supabase next-generation distributed connection pooler operating on port 6543). The pooler maintains a warm pool of 30 persistent PostgreSQL server connections, multiplexing short-lived REST queries and transaction blocks across these connections with sub-2 ms checkout latency.

## Options Considered

| Option | Pros | Cons | Score (1-5) |
| :--- | :--- | :--- | :--- |
| **Option 1: Supavisor in Transaction Pooling Mode (Chosen)** | Native integration with Supabase; written in Elixir for extreme concurrent throughput; sub-2ms connection checkout; bounds server connections to 30 while serving 100+ concurrent clients. | Prepared statements require careful handling in transaction mode; session-level PostgreSQL parameters (`SET timezone`) cannot be permanently persisted across requests. | **5/5** |
| **Option 2: Standalone pgBouncer VM** | Decades of battle-tested production reliability in high-traffic PostgreSQL deployments. | Requires provisioning, patching, and maintaining a separate compute virtual machine; manual config file updates for authentication users. | **3/5** |
| **Option 3: Direct Unpooled PostgreSQL Connections (Port 5432)** | Supports arbitrary session-level configuration, advisory locks, and long-lived prepared statements. | 100 concurrent clients quickly exhaust server connection limits; connection storm during traffic spikes crashes the database instance. | **1/5** |

## Trade-offs & What We Lose (The Named Loser)
**The Loser: Direct PostgreSQL Connections and Session-Level Stateful Pooling.**
By selecting Supavisor in transaction pooling mode, we lose support for long-lived session-level PostgreSQL state. Specifically, application code cannot rely on session-level temporary tables, session-scoped advisory locks, or persistent session variables across multiple HTTP requests. Every database transaction must be completely self-contained and stateless, setting local claims via `SET LOCAL` within the transaction boundary.

## Consequences
- **Positive**: Hard caps database connection count at 30, protecting the PostgreSQL server from out-of-memory crashes; supports thousands of concurrent client HTTP connections; sub-2 ms checkout.
- **Negative**: Client applications must connect via port 6543 rather than 5432 and must avoid `LISTEN/NOTIFY` over pooled connections (PostgreSQL Realtime handles pub/sub over dedicated channels).
- **Capacity Proof**: As proven in `docs/capacity.md`, 100 peak RPS with 12 ms average database query duration requires only 1.2 average active connections (`L = 100 × 0.012`), well within our 30-connection pool limit.
