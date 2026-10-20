# Data Classification & Schema Security Policy

## Coordination Note to R3 (Database & Infrastructure Engineer)
> **Attention R3**: The classifications in this table are enforceable security contracts. When provisioning PostgreSQL tables and writing Row Level Security (RLS) policies in `supabase/migrations/**`:
> 1. All columns labeled **RESTRICTED** must be inaccessible to anonymous clients and accessible ONLY by the matching authenticated `user_id` (`auth.uid() = user_id`).
> 2. All columns labeled **CONFIDENTIAL** contain evaluation and proctor audit records; they require proctor role verification or cryptographic HMAC signing.
> 3. Zero real user personal identifiable information (PII) beyond anonymized UUIDs and synthetic email handles shall be persisted.

---

## 1. Column-Level Data Classification Table

Classification Tiers:
- **PUBLIC**: Freely accessible by unauthenticated browsers without identity checks.
- **INTERNAL**: Accessible by all authenticated candidates within the platform.
- **RESTRICTED**: Private to the specific candidate; readable/writable ONLY by the authenticated row owner via RLS.
- **CONFIDENTIAL**: High-integrity administrative and proctor audit data; immutable once written; read-restricted to proctors and audit evaluators.

| Table Name | Column Name | PostgreSQL Data Type | Classification Tier | RLS Enforcement & Access Control Rule |
| :--- | :--- | :--- | :--- | :--- |
| **`scenarios`** | `id` | `VARCHAR(32)` | **PUBLIC** | Unrestricted SELECT for all clients (`USING (true)`). |
| `scenarios` | `title` | `TEXT` | **PUBLIC** | Unrestricted SELECT for all clients (`USING (true)`). |
| `scenarios` | `difficulty` | `VARCHAR(16)` | **PUBLIC** | Unrestricted SELECT for all clients (`USING (true)`). |
| `scenarios` | `objective` | `TEXT` | **PUBLIC** | Unrestricted SELECT for all clients (`USING (true)`). |
| `scenarios` | `topology` | `JSONB` | **PUBLIC** | Declarative synthetic nodes and edges; public read. |
| `scenarios` | `rules` | `JSONB` | **PUBLIC** | Declarative verification rule definitions; public read. |
| `scenarios` | `hints` | `JSONB` | **INTERNAL** | Accessible to authenticated candidates during scenario attempts. |
| `scenarios` | `is_active` | `BOOLEAN` | **INTERNAL** | Filtered by query; unauthenticated sees only `is_active = true`. |
| **`user_sessions`** | `id` | `UUID` | **RESTRICTED** | Primary Key; readable and writable ONLY by owning candidate (`auth.uid() = user_id`). |
| `user_sessions` | `user_id` | `UUID` | **RESTRICTED** | Foreign key to `auth.users(id)`; immutable; strictly bound to `auth.uid()`. |
| `user_sessions` | `scenario_id` | `VARCHAR(32)` | **RESTRICTED** | Foreign key to `scenarios(id)`; readable ONLY by session owner. |
| `user_sessions` | `status` | `VARCHAR(16)` | **RESTRICTED** | Values: `IN_PROGRESS`, `RESOLVED`, `ABANDONED`; owner-only access. |
| `user_sessions` | `score` | `INTEGER` | **RESTRICTED** | Calculated score (0-100); owner-only access. |
| `user_sessions` | `started_at` | `TIMESTAMPTZ` | **RESTRICTED** | Creation timestamp; owner-only access. |
| `user_sessions` | `completed_at`| `TIMESTAMPTZ` | **RESTRICTED** | Resolution timestamp; owner-only access. |
| **`session_patches`**| `id` | `UUID` | **RESTRICTED** | Primary Key; patch record ID; owner-only access. |
| `session_patches`| `session_id` | `UUID` | **RESTRICTED** | Foreign key to `user_sessions(id) ON DELETE CASCADE`; RLS checked via parent session. |
| `session_patches`| `node_id` | `TEXT` | **RESTRICTED** | Identifier of remediated node (`alb-public-01`); owner-only. |
| `session_patches`| `property` | `TEXT` | **RESTRICTED** | Remediated property path (`listener_port`); owner-only. |
| `session_patches`| `previous_value`| `JSONB` | **RESTRICTED** | Previous state prior to patch; owner-only. |
| `session_patches`| `new_value` | `JSONB` | **RESTRICTED** | New target value applied; owner-only. |
| `session_patches`| `applied_at` | `TIMESTAMPTZ` | **RESTRICTED** | Timestamp of mutation; owner-only. |
| **`verification_audit_logs`** | `id` | `UUID` | **CONFIDENTIAL** | Primary Key; immutable audit event ID. |
| `verification_audit_logs` | `session_id` | `UUID` | **CONFIDENTIAL** | Foreign key to `user_sessions(id)`; readable by session owner and proctors. |
| `verification_audit_logs` | `final_score` | `INTEGER` | **CONFIDENTIAL** | Verified final score (0-100); immutable once written. |
| `verification_audit_logs` | `rules_passed`| `INTEGER` | **CONFIDENTIAL** | Total passing rules count; immutable. |
| `verification_audit_logs` | `rules_total` | `INTEGER` | **CONFIDENTIAL** | Total rule count; immutable. |
| `verification_audit_logs` | `audit_payload`| `JSONB` | **CONFIDENTIAL** | Complete cryptographic session snapshot; readable only by proctors and session owner. |
| `verification_audit_logs` | `created_at` | `TIMESTAMPTZ` | **CONFIDENTIAL** | Audit commit timestamp (`now()`); immutable. |
| **`feature_flags`**| `flag_name` | `VARCHAR(64)` | **PUBLIC** | Unique flag identifier; readable by all clients. |
| `feature_flags` | `is_enabled` | `BOOLEAN` | **PUBLIC** | Current flag evaluation status; readable by all clients. |
| `feature_flags` | `owner_role` | `VARCHAR(32)` | **INTERNAL** | Role responsible for flag governance (`Product Owner`, `Security Proctor`). |
| `feature_flags` | `kill_switch_behavior` | `TEXT` | **INTERNAL** | Operational fallback specification; readable by internal roles. |

---

## 2. Retention & Privacy Standards
- **Candidate Data Privacy**: Zero personal PII is requested or persisted. User accounts are identified solely by pseudonymized UUIDs issued by Supabase Auth.
- **Audit Immutability**: The `verification_audit_logs` table has PostgreSQL `UPDATE` and `DELETE` privileges permanently revoked for all roles except the administrative service key:
  ```sql
  REVOKE UPDATE, DELETE ON verification_audit_logs FROM authenticated, anon;
  ```
