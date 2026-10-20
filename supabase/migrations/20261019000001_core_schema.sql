-- Migration: 20261019000001_core_schema.sql
-- Description: Core relational schema for Cloud Readiness Engine
-- Idempotent: Yes
-- Rollback:
--   DROP TABLE IF EXISTS quiz_attempts CASCADE;
--   DROP TABLE IF EXISTS quiz_sessions CASCADE;
--   DROP TABLE IF EXISTS readiness_snapshots CASCADE;
--   DROP TABLE IF EXISTS questions CASCADE;
--   DROP TABLE IF EXISTS question_domains CASCADE;
--   DROP TABLE IF EXISTS profiles CASCADE;
--   DROP TABLE IF EXISTS feature_flags CASCADE;
--   DROP FUNCTION IF EXISTS set_updated_at_timestamp CASCADE;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Function: update updated_at timestamp
CREATE OR REPLACE FUNCTION set_updated_at_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = clock_timestamp();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Table: profiles
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- Table: question_domains
CREATE TABLE IF NOT EXISTS question_domains (
  id VARCHAR(32) PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  display_order INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- Table: questions
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain_id VARCHAR(32) NOT NULL REFERENCES question_domains(id) ON DELETE RESTRICT,
  difficulty VARCHAR(16) NOT NULL CHECK (difficulty IN ('Novice', 'Associate', 'Advanced')),
  prompt TEXT NOT NULL,
  options JSONB NOT NULL CHECK (jsonb_typeof(options) = 'array' AND jsonb_array_length(options) = 4),
  correct_answer_index INT NOT NULL CHECK (correct_answer_index BETWEEN 0 AND 3),
  explanation TEXT NOT NULL,
  source_outline_theme TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- Table: quiz_sessions
CREATE TABLE IF NOT EXISTS quiz_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  domain_id VARCHAR(32) REFERENCES question_domains(id) ON DELETE SET NULL,
  status VARCHAR(16) NOT NULL DEFAULT 'IN_PROGRESS' CHECK (status IN ('IN_PROGRESS', 'RESOLVED', 'TIMED_OUT', 'ABANDONED')),
  score INT NOT NULL DEFAULT 0 CHECK (score BETWEEN 0 AND 100),
  total_questions INT NOT NULL DEFAULT 10,
  started_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- Table: quiz_attempts
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES quiz_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  selected_index INT NOT NULL CHECK (selected_index BETWEEN 0 AND 3),
  is_correct BOOLEAN NOT NULL,
  time_taken_ms INT NOT NULL CHECK (time_taken_ms >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- Table: readiness_snapshots
CREATE TABLE IF NOT EXISTS readiness_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  overall_score INT NOT NULL CHECK (overall_score BETWEEN 0 AND 100),
  domain_scores JSONB NOT NULL DEFAULT '{}'::jsonb,
  evaluation_grade VARCHAR(16) NOT NULL CHECK (evaluation_grade IN ('READY', 'REVIEW_REQUIRED', 'NOT_READY')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- Table: feature_flags
CREATE TABLE IF NOT EXISTS feature_flags (
  flag_name VARCHAR(64) PRIMARY KEY,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  owner_role VARCHAR(32) NOT NULL,
  kill_switch_behavior TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- Triggers for updated_at
DROP TRIGGER IF EXISTS trg_profiles_updated_at ON profiles;
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();

DROP TRIGGER IF EXISTS trg_quiz_sessions_updated_at ON quiz_sessions;
CREATE TRIGGER trg_quiz_sessions_updated_at
  BEFORE UPDATE ON quiz_sessions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();

DROP TRIGGER IF EXISTS trg_feature_flags_updated_at ON feature_flags;
CREATE TRIGGER trg_feature_flags_updated_at
  BEFORE UPDATE ON feature_flags
  FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();
