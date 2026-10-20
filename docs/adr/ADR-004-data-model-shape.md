# ADR-004: Relational vs Document Schema Shape for Topology Scenarios and Patch Logs

## Status
Accepted

## Context
Cloud infrastructure topologies are inherently graph-structured trees containing arbitrary configuration attributes (ports, CIDRs, route tables, SSL ciphers). Concurrently, user sessions, audit events, and scored attempts require strict relational integrity, foreign key cascading, and point-in-time timestamping. We must select the data model shape that balances flexible scenario definitions with strict relational accountability.

## Decision
We select a **Hybrid Relational Core with Structured JSONB Payloads** in PostgreSQL. Relational tables enforce strict identity, ownership, and state transitions (`scenarios`, `user_sessions`, `session_patches`, `verification_audit_logs`), while topology graph definitions and configuration attributes reside within schema-validated `jsonb` columns.

## Options Considered

| Option | Pros | Cons | Score (1-5) |
| :--- | :--- | :--- | :--- |
| **Option 1: Hybrid Relational Schema with JSONB Topologies (Chosen)** | Relational integrity for user ownership and timestamps; JSONB flexibility for diverse synthetic cloud nodes without constant table migrations; GIN indexing supports fast JSON sub-property queries. | Requires PostgreSQL-specific JSON operators (`->>`, `@>`) in complex queries; application code must enforce strict TypeScript validation on JSON payloads. | **5/5** |
| **Option 2: Purely Normalized Relational Schema (EAV / 15+ Tables)** | Perfect third normal form; foreign key constraints on every individual node attribute and port; standard SQL joins across all properties. | Extreme schema rigidity; adding a new synthetic cloud resource type (e.g. Serverless Function) requires running 3 separate DDL migrations; queries require 7+ table joins. | **3/5** |
| **Option 3: Pure NoSQL Document Database (MongoDB / DynamoDB)** | Schemaless document storage; matches JSON representation of cloud architectures directly; simple single-document retrieval. | No cross-document transactional guarantees; lack of foreign key cascading allows orphaned patch records; cannot leverage PostgreSQL RLS. | **2/5** |

## Trade-offs & What We Lose (The Named Loser)
**The Loser: Purely Normalized Relational Schema (EAV).**
By choosing JSONB for topology graphs, we lose the ability of the database engine to enforce column-level foreign key constraints and type checks on individual node properties (such as verifying at the SQL DDL level that `listener_port` is an integer between 1 and 65535). Instead, this validation must be guaranteed via PostgreSQL `CHECK` constraints (`CHECK (jsonb_typeof(topology->'nodes') = 'array')`) combined with strict TypeScript Zod schemas at the application boundary.

## Consequences
- **Positive**: Adding new synthetic scenario objectives requires zero database downtime or migration scripts; session ownership and audit logs remain strictly relational and ACID-compliant.
- **Negative**: Queries filtering deeply nested JSON properties require GIN indexes (`CREATE INDEX idx_scenarios_topology ON scenarios USING gin (topology);`).
- **Schema Shape**:
  - `scenarios` (id VARCHAR PRIMARY KEY, title TEXT, difficulty TEXT, topology JSONB, rules JSONB, is_active BOOLEAN)
  - `user_sessions` (id UUID PRIMARY KEY, user_id UUID REFERENCES auth.users, scenario_id VARCHAR REFERENCES scenarios, status TEXT, started_at TIMESTAMPTZ)
  - `session_patches` (id UUID PRIMARY KEY, session_id UUID REFERENCES user_sessions ON DELETE CASCADE, node_id TEXT, property TEXT, previous_val JSONB, new_val JSONB, created_at TIMESTAMPTZ)
  - `verification_audit_logs` (id UUID PRIMARY KEY, session_id UUID REFERENCES user_sessions, final_score INT, rules_passed INT, rules_total INT, audit_payload JSONB, created_at TIMESTAMPTZ)
