-- Migration: 20261019000002_retention.sql
-- Description: Retention, soft-delete columns, hard-purge function, and export view
-- Idempotent: Yes
-- Rollback:
--   DROP VIEW IF EXISTS v_candidate_export_data CASCADE;
--   DROP FUNCTION IF EXISTS purge_expired_records(INT) CASCADE;
--   ALTER TABLE quiz_sessions DROP COLUMN IF EXISTS deleted_at;
--   ALTER TABLE quiz_attempts DROP COLUMN IF EXISTS deleted_at;
--   ALTER TABLE readiness_snapshots DROP COLUMN IF EXISTS deleted_at;

-- Add soft-delete columns to RESTRICTED tables
ALTER TABLE quiz_sessions
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ NULL;

ALTER TABLE quiz_attempts
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ NULL;

ALTER TABLE readiness_snapshots
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ NULL;

-- Function: purge_expired_records
-- Permanently deletes soft-deleted records older than the specified retention window (default 30 days)
CREATE OR REPLACE FUNCTION purge_expired_records(retention_days INT DEFAULT 30)
RETURNS TABLE (
  purged_attempts_count BIGINT,
  purged_sessions_count BIGINT,
  purged_snapshots_count BIGINT
) AS $$
DECLARE
  v_cutoff_time TIMESTAMPTZ := clock_timestamp() - (retention_days || ' days')::interval;
  v_deleted_attempts BIGINT := 0;
  v_deleted_sessions BIGINT := 0;
  v_deleted_snapshots BIGINT := 0;
BEGIN
  -- 1. Purge expired quiz_attempts directly marked soft-deleted
  WITH deleted_attempts AS (
    DELETE FROM quiz_attempts
    WHERE deleted_at IS NOT NULL AND deleted_at < v_cutoff_time
    RETURNING id
  )
  SELECT count(*) INTO v_deleted_attempts FROM deleted_attempts;

  -- 2. Purge expired quiz_sessions (foreign keys cascade to remaining attempts)
  WITH deleted_sessions AS (
    DELETE FROM quiz_sessions
    WHERE deleted_at IS NOT NULL AND deleted_at < v_cutoff_time
    RETURNING id
  )
  SELECT count(*) INTO v_deleted_sessions FROM deleted_sessions;

  -- 3. Purge expired readiness_snapshots
  WITH deleted_snapshots AS (
    DELETE FROM readiness_snapshots
    WHERE deleted_at IS NOT NULL AND deleted_at < v_cutoff_time
    RETURNING id
  )
  SELECT count(*) INTO v_deleted_snapshots FROM deleted_snapshots;

  RETURN QUERY SELECT v_deleted_attempts, v_deleted_sessions, v_deleted_snapshots;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- View: v_candidate_export_data
-- Filtered view providing active session history and scores for GDPR / proctor export
CREATE OR REPLACE VIEW v_candidate_export_data AS
SELECT
  s.id AS session_id,
  s.user_id,
  s.domain_id,
  d.title AS domain_title,
  s.status,
  s.score,
  s.total_questions,
  s.started_at,
  s.completed_at,
  COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'attempt_id', a.id,
        'question_id', a.question_id,
        'selected_index', a.selected_index,
        'is_correct', a.is_correct,
        'time_taken_ms', a.time_taken_ms,
        'created_at', a.created_at
      ) ORDER BY a.created_at ASC
    ) FILTER (WHERE a.id IS NOT NULL),
    '[]'::jsonb
  ) AS attempts
FROM quiz_sessions s
LEFT JOIN question_domains d ON s.domain_id = d.id
LEFT JOIN quiz_attempts a ON s.id = a.session_id AND a.deleted_at IS NULL
WHERE s.deleted_at IS NULL
GROUP BY s.id, s.user_id, s.domain_id, d.title, s.status, s.score, s.total_questions, s.started_at, s.completed_at;
