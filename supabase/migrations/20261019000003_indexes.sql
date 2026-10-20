-- Migration: 20261019000003_indexes.sql
-- Description: Composite and foreign key performance indexes
-- Idempotent: Yes
-- Rollback:
--   DROP INDEX IF EXISTS idx_quiz_sessions_user_history;
--   DROP INDEX IF EXISTS idx_quiz_sessions_deleted_at;
--   DROP INDEX IF EXISTS idx_quiz_attempts_user_history;
--   DROP INDEX IF EXISTS idx_quiz_attempts_session_id;
--   DROP INDEX IF EXISTS idx_quiz_attempts_question_id;
--   DROP INDEX IF EXISTS idx_questions_domain_difficulty;
--   DROP INDEX IF EXISTS idx_readiness_user_created;

-- 1. Index: User session history paging (serves GET /rest/v1/quiz_sessions)
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_user_history
  ON quiz_sessions (user_id, started_at DESC)
  WHERE deleted_at IS NULL;

-- 2. Index: Partial index on soft-deleted sessions for high-speed retention purge
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_deleted_at
  ON quiz_sessions (deleted_at)
  WHERE deleted_at IS NOT NULL;

-- 3. Index: Candidate attempt history and readiness grouping (serves POST /rpc/calculate_readiness)
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_history
  ON quiz_attempts (user_id, created_at DESC)
  WHERE deleted_at IS NULL;

-- 4. Index: Foreign key lookup for session attempts join
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_session_id
  ON quiz_attempts (session_id);

-- 5. Index: Question lookup on attempts
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_question_id
  ON quiz_attempts (question_id);

-- 6. Index: Question syllabus domain and difficulty filtering (serves GET /rest/v1/questions)
CREATE INDEX IF NOT EXISTS idx_questions_domain_difficulty
  ON questions (domain_id, difficulty);

-- 7. Index: Candidate readiness snapshot lookup (serves GET /rest/v1/readiness_snapshots)
CREATE INDEX IF NOT EXISTS idx_readiness_user_created
  ON readiness_snapshots (user_id, created_at DESC)
  WHERE deleted_at IS NULL;
