# Data Model & Schema Specification: Cloud Readiness Engine

## 1. Compliance Disclaimer
This database schema is an independent educational diagnostic specification. It contains zero vendor trademarks, zero proprietary vendor brand marks, and zero real certification test items or proprietary dumps. All questions, taxonomy domains, and scoring models are synthetic first-principles artifacts.

---

## 2. Entity-Relationship Diagram (ERD)

![Database Architecture & Entity-Relationship Diagram](diagrams/generated/database_erd.png)

*Python Database Architecture as Code: [`docs/diagrams/database_erd.py`](diagrams/database_erd.py)*

```mermaid
erDiagram
    PROFILES ||--o{ QUIZ_SESSIONS : "initiates"
    PROFILES ||--o{ READINESS_SNAPSHOTS : "owns"
    QUESTION_DOMAINS ||--o{ QUESTIONS : "categorizes"
    QUIZ_SESSIONS ||--o{ QUIZ_ATTEMPTS : "records"
    QUESTIONS ||--o{ QUIZ_ATTEMPTS : "targeted_by"
    QUESTION_DOMAINS ||--o{ QUIZ_SESSIONS : "scopes"

    PROFILES {
        uuid id PK "references auth.users(id)"
        text username "UNIQUE"
        text full_name
        timestamptz created_at
        timestamptz updated_at
    }

    QUESTION_DOMAINS {
        varchar(32) id PK "e.g. DOM-CLOUD-CONCEPTS"
        text title
        text description
        integer display_order
        timestamptz created_at
    }

    QUESTIONS {
        uuid id PK
        varchar(32) domain_id FK "references question_domains(id)"
        varchar(16) difficulty "Novice, Associate, Advanced"
        text prompt "Synthetic question text"
        jsonb options "Array of 4 options"
        integer correct_answer_index "0 to 3"
        text explanation
        text source_outline_theme "Public syllabus topic"
        timestamptz created_at
    }

    QUIZ_SESSIONS {
        uuid id PK
        uuid user_id FK "references profiles(id)"
        varchar(32) domain_id FK "references question_domains(id)"
        varchar(16) status "IN_PROGRESS, RESOLVED, TIMED_OUT"
        integer score "0 to 100"
        integer total_questions
        timestamptz started_at
        timestamptz completed_at
        timestamptz deleted_at "Soft-delete"
    }

    QUIZ_ATTEMPTS {
        uuid id PK
        uuid session_id FK "references quiz_sessions(id)"
        uuid user_id FK "references profiles(id)"
        uuid question_id FK "references questions(id)"
        integer selected_index "0 to 3"
        boolean is_correct
        integer time_taken_ms
        timestamptz created_at
        timestamptz deleted_at "Soft-delete"
    }

    READINESS_SNAPSHOTS {
        uuid id PK
        uuid user_id FK "references profiles(id)"
        integer overall_score "0 to 100"
        jsonb domain_scores "Breakdown per domain"
        varchar(16) evaluation_grade "READY, REVIEW_REQUIRED"
        timestamptz created_at
        timestamptz deleted_at "Soft-delete"
    }

    FEATURE_FLAGS {
        varchar(64) flag_name PK
        boolean is_enabled
        varchar(32) owner_role
        text kill_switch_behavior
        timestamptz updated_at
    }
```

---

## 3. Ownership & Audit Standard

### Ownership Columns
- Every candidate-owned record (`quiz_sessions`, `quiz_attempts`, `readiness_snapshots`) mandates a foreign key `user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE`.
- This column is immutable and bound unconditionally to the active PostgreSQL session claim `auth.uid()`.

### Audit Columns
- `created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()`
- `updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()`
- An automated trigger `set_updated_at_timestamp()` updates `updated_at` on every `UPDATE` statement.

---

## 4. Soft-Delete & 30-Day Retention Policy

### Soft-Delete Standard
All tables categorized as **RESTRICTED** (`quiz_sessions`, `quiz_attempts`, `readiness_snapshots`) include a `deleted_at TIMESTAMPTZ NULL` column.
- Application queries through PostgREST evaluate `deleted_at IS NULL` via default views or RLS policies.
- User deletion requests set `deleted_at = clock_timestamp()` without destroying the row immediately, preserving proctor auditability for 30 days.

### Hard-Purge Job
A scheduled PostgreSQL function `purge_expired_records(retention_days INT)` runs nightly at 03:00 UTC:
- Permanently deletes rows where `deleted_at < now() - (retention_days || ' days')::interval`.
- Cascades from `quiz_sessions` down to `quiz_attempts`.

---

## 5. Index-to-Query & Endpoint Mapping Table

Every index in the database is strictly mapped to an operational API endpoint and documented SQL query.

| Index Name | Table | Indexed Columns | Endpoint Served | Specific Query Pattern | Scan Type Verified |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`idx_quiz_sessions_user_history`** | `quiz_sessions` | `(user_id, started_at DESC)` | `GET /rest/v1/quiz_sessions` | `SELECT * FROM quiz_sessions WHERE user_id = $1 AND deleted_at IS NULL ORDER BY started_at DESC LIMIT 20` | **Index Scan** (no filesort) |
| **`idx_quiz_attempts_user_domain`** | `quiz_attempts` | `(user_id, created_at DESC)` | `POST /rpc/calculate_readiness` | `SELECT domain_id, AVG(is_correct::int) FROM quiz_attempts a JOIN questions q ON a.question_id = q.id WHERE a.user_id = $1 AND a.deleted_at IS NULL GROUP BY domain_id` | **Bitmap Index Scan** |
| **`idx_quiz_attempts_session_id`** | `quiz_attempts` | `(session_id)` | `GET /rest/v1/quiz_sessions?select=*,quiz_attempts(*)` | `SELECT * FROM quiz_attempts WHERE session_id = $1 AND deleted_at IS NULL` | **Index Scan** |
| **`idx_questions_domain_difficulty`**| `questions` | `(domain_id, difficulty)` | `GET /rest/v1/questions` | `SELECT * FROM questions WHERE domain_id = $1 AND difficulty = $2 ORDER BY random() LIMIT 10` | **Bitmap Index Scan** |
| **`idx_readiness_user_created`** | `readiness_snapshots` | `(user_id, created_at DESC)` | `GET /rest/v1/readiness_snapshots` | `SELECT * FROM readiness_snapshots WHERE user_id = $1 AND deleted_at IS NULL ORDER BY created_at DESC LIMIT 1` | **Index Scan** |
| **`idx_quiz_sessions_deleted_at`** | `quiz_sessions` | `(deleted_at) WHERE deleted_at IS NOT NULL` | Nightly Hard-Purge Cron | `DELETE FROM quiz_sessions WHERE deleted_at < now() - interval '30 days'` | **Index Scan** (partial index) |
