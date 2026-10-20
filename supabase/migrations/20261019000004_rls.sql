-- Migration: 20261019000004_rls.sql
-- Description: Complete Row Level Security policies with FORCE ROW LEVEL SECURITY
-- Idempotent: Yes
-- Rollback:
--   ALTER TABLE profiles NO FORCE ROW LEVEL SECURITY;
--   ALTER TABLE question_domains NO FORCE ROW LEVEL SECURITY;
--   ALTER TABLE questions NO FORCE ROW LEVEL SECURITY;
--   ALTER TABLE quiz_sessions NO FORCE ROW LEVEL SECURITY;
--   ALTER TABLE quiz_attempts NO FORCE ROW LEVEL SECURITY;
--   ALTER TABLE readiness_snapshots NO FORCE ROW LEVEL SECURITY;
--   ALTER TABLE feature_flags NO FORCE ROW LEVEL SECURITY;

-- 1. Enable and Force RLS on all user-facing tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles FORCE ROW LEVEL SECURITY;

ALTER TABLE question_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_domains FORCE ROW LEVEL SECURITY;

ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions FORCE ROW LEVEL SECURITY;

ALTER TABLE quiz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_sessions FORCE ROW LEVEL SECURITY;

ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts FORCE ROW LEVEL SECURITY;

ALTER TABLE readiness_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE readiness_snapshots FORCE ROW LEVEL SECURITY;

ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flags FORCE ROW LEVEL SECURITY;

-- =========================================================================
-- TABLE: profiles
-- =========================================================================

-- Intent: Anyone authenticated can view public candidate profiles
DROP POLICY IF EXISTS "profiles_select_public" ON profiles;
CREATE POLICY "profiles_select_public" ON profiles
  FOR SELECT
  USING (true);

-- Intent: Users can only insert their own profile matching auth.uid()
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Intent: Users can only update their own profile matching auth.uid()
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Intent: Users can delete their own profile matching auth.uid()
DROP POLICY IF EXISTS "profiles_delete_own" ON profiles;
CREATE POLICY "profiles_delete_own" ON profiles
  FOR DELETE
  USING (auth.uid() = id);

-- =========================================================================
-- TABLE: question_domains
-- =========================================================================

-- Intent: Public read access for syllabus domains
DROP POLICY IF EXISTS "domains_select_all" ON question_domains;
CREATE POLICY "domains_select_all" ON question_domains
  FOR SELECT
  USING (true);

-- Intent: Disallow unprivileged client inserts
DROP POLICY IF EXISTS "domains_insert_service_only" ON question_domains;
CREATE POLICY "domains_insert_service_only" ON question_domains
  FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Intent: Disallow unprivileged client updates
DROP POLICY IF EXISTS "domains_update_service_only" ON question_domains;
CREATE POLICY "domains_update_service_only" ON question_domains
  FOR UPDATE
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Intent: Disallow unprivileged client deletes
DROP POLICY IF EXISTS "domains_delete_service_only" ON question_domains;
CREATE POLICY "domains_delete_service_only" ON question_domains
  FOR DELETE
  USING (auth.jwt() ->> 'role' = 'service_role');

-- =========================================================================
-- TABLE: questions
-- =========================================================================

-- Intent: All authenticated candidates can read questions
DROP POLICY IF EXISTS "questions_select_all" ON questions;
CREATE POLICY "questions_select_all" ON questions
  FOR SELECT
  USING (true);

-- Intent: Disallow non-service client writes
DROP POLICY IF EXISTS "questions_insert_service_only" ON questions;
CREATE POLICY "questions_insert_service_only" ON questions
  FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Intent: Disallow non-service client updates
DROP POLICY IF EXISTS "questions_update_service_only" ON questions;
CREATE POLICY "questions_update_service_only" ON questions
  FOR UPDATE
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Intent: Disallow non-service client deletes
DROP POLICY IF EXISTS "questions_delete_service_only" ON questions;
CREATE POLICY "questions_delete_service_only" ON questions
  FOR DELETE
  USING (auth.jwt() ->> 'role' = 'service_role');

-- =========================================================================
-- TABLE: quiz_sessions
-- =========================================================================

-- Intent: Candidates can only select their own quiz sessions
DROP POLICY IF EXISTS "sessions_select_own" ON quiz_sessions;
CREATE POLICY "sessions_select_own" ON quiz_sessions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Intent: Candidates can only insert sessions bound to their own auth.uid()
DROP POLICY IF EXISTS "sessions_insert_own" ON quiz_sessions;
CREATE POLICY "sessions_insert_own" ON quiz_sessions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Intent: Candidates can only update their own sessions
DROP POLICY IF EXISTS "sessions_update_own" ON quiz_sessions;
CREATE POLICY "sessions_update_own" ON quiz_sessions
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Intent: Candidates can only delete/soft-delete their own sessions
DROP POLICY IF EXISTS "sessions_delete_own" ON quiz_sessions;
CREATE POLICY "sessions_delete_own" ON quiz_sessions
  FOR DELETE
  USING (auth.uid() = user_id);

-- =========================================================================
-- TABLE: quiz_attempts
-- =========================================================================

-- Intent: Candidates can only select attempts belonging to their own sessions
DROP POLICY IF EXISTS "attempts_select_own" ON quiz_attempts;
CREATE POLICY "attempts_select_own" ON quiz_attempts
  FOR SELECT
  USING (auth.uid() = user_id);

-- Intent: Candidates can only insert attempts bound to their own user_id and session
DROP POLICY IF EXISTS "attempts_insert_own" ON quiz_attempts;
CREATE POLICY "attempts_insert_own" ON quiz_attempts
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM quiz_sessions s
      WHERE s.id = session_id AND s.user_id = auth.uid()
    )
  );

-- Intent: Attempts are immutable; candidates cannot alter past answers
DROP POLICY IF EXISTS "attempts_update_blocked" ON quiz_attempts;
CREATE POLICY "attempts_update_blocked" ON quiz_attempts
  FOR UPDATE
  USING (false);

-- Intent: Candidates can delete their own attempts
DROP POLICY IF EXISTS "attempts_delete_own" ON quiz_attempts;
CREATE POLICY "attempts_delete_own" ON quiz_attempts
  FOR DELETE
  USING (auth.uid() = user_id);

-- =========================================================================
-- TABLE: readiness_snapshots
-- =========================================================================

-- Intent: Candidates can view their own readiness snapshot
DROP POLICY IF EXISTS "snapshots_select_own" ON readiness_snapshots;
CREATE POLICY "snapshots_select_own" ON readiness_snapshots
  FOR SELECT
  USING (auth.uid() = user_id);

-- Intent: Candidates can insert snapshots computed for their own account
DROP POLICY IF EXISTS "snapshots_insert_own" ON readiness_snapshots;
CREATE POLICY "snapshots_insert_own" ON readiness_snapshots
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Intent: Snapshots are point-in-time immutable; updates disallowed
DROP POLICY IF EXISTS "snapshots_update_blocked" ON readiness_snapshots;
CREATE POLICY "snapshots_update_blocked" ON readiness_snapshots
  FOR UPDATE
  USING (false);

-- Intent: Candidates can delete their own snapshots
DROP POLICY IF EXISTS "snapshots_delete_own" ON readiness_snapshots;
CREATE POLICY "snapshots_delete_own" ON readiness_snapshots
  FOR DELETE
  USING (auth.uid() = user_id);

-- =========================================================================
-- TABLE: feature_flags
-- =========================================================================

-- Intent: Public read access for feature flags
DROP POLICY IF EXISTS "flags_select_all" ON feature_flags;
CREATE POLICY "flags_select_all" ON feature_flags
  FOR SELECT
  USING (true);

-- Intent: Non-service client inserts disallowed
DROP POLICY IF EXISTS "flags_insert_service_only" ON feature_flags;
CREATE POLICY "flags_insert_service_only" ON feature_flags
  FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Intent: Non-service client updates disallowed
DROP POLICY IF EXISTS "flags_update_service_only" ON feature_flags;
CREATE POLICY "flags_update_service_only" ON feature_flags
  FOR UPDATE
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Intent: Non-service client deletes disallowed
DROP POLICY IF EXISTS "flags_delete_service_only" ON feature_flags;
CREATE POLICY "flags_delete_service_only" ON feature_flags
  FOR DELETE
  USING (auth.jwt() ->> 'role' = 'service_role');
