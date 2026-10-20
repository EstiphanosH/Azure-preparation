/**
 * Retention and Hard-Purge Lifecycle Test Harness
 * Evaluates soft-delete isolation and hard-purge execution for RESTRICTED tables.
 * Executable directly via: npx tsx supabase/tests/retention.ts
 */

interface SessionRecord {
  id: string;
  user_id: string;
  status: string;
  score: number;
  created_at: Date;
  deleted_at: Date | null;
}

interface AttemptRecord {
  id: string;
  session_id: string;
  user_id: string;
  question_id: string;
  selected_index: number;
  is_correct: boolean;
  time_taken_ms: number;
  created_at: Date;
  deleted_at: Date | null;
}

class RetentionEngine {
  private sessions: SessionRecord[] = [];
  private attempts: AttemptRecord[] = [];

  public seedSession(session: SessionRecord) {
    this.sessions.push(session);
  }

  public seedAttempt(attempt: AttemptRecord) {
    this.attempts.push(attempt);
  }

  // Simulates candidate view: v_candidate_export_data WHERE deleted_at IS NULL
  public queryActiveSessions(userId: string): SessionRecord[] {
    return this.sessions.filter((s) => s.user_id === userId && s.deleted_at === null);
  }

  // Simulates hard-purge procedure: purge_expired_records(retention_days)
  public purgeExpiredRecords(retentionDays = 30): { purgedAttempts: number; purgedSessions: number } {
    const cutoffTime = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);

    const initialAttempts = this.attempts.length;
    // 1. Purge expired attempts directly soft-deleted
    this.attempts = this.attempts.filter(
      (a) => a.deleted_at === null || a.deleted_at >= cutoffTime
    );

    const initialSessions = this.sessions.length;
    // 2. Identify expired soft-deleted sessions
    const expiredSessionIds = new Set(
      this.sessions
        .filter((s) => s.deleted_at !== null && s.deleted_at < cutoffTime)
        .map((s) => s.id)
    );

    // Cascade delete attempts belonging to purged sessions
    this.attempts = this.attempts.filter((a) => !expiredSessionIds.has(a.session_id));
    this.sessions = this.sessions.filter((s) => !expiredSessionIds.has(s.id));

    const purgedAttempts = initialAttempts - this.attempts.length;
    const purgedSessions = initialSessions - this.sessions.length;

    return { purgedAttempts, purgedSessions };
  }

  public getRawCounts(): { totalSessions: number; totalAttempts: number } {
    return {
      totalSessions: this.sessions.length,
      totalAttempts: this.attempts.length,
    };
  }
}

async function runRetentionTestSuite() {
  console.log('================================================================');
  console.log('   RUNNING RETENTION & HARD-PURGE AUTOMATED VERIFICATION TEST   ');
  console.log('================================================================');

  const engine = new RetentionEngine();
  const userId = 'usr-candidate-audit-123';
  const now = new Date();

  // 1. Seed Active Session (0 days old, active)
  const activeSession: SessionRecord = {
    id: 'ses-active-01',
    user_id: userId,
    status: 'RESOLVED',
    score: 95,
    created_at: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days old
    deleted_at: null,
  };
  engine.seedSession(activeSession);

  engine.seedAttempt({
    id: 'att-active-01',
    session_id: activeSession.id,
    user_id: userId,
    question_id: 'q-101',
    selected_index: 1,
    is_correct: true,
    time_taken_ms: 3200,
    created_at: activeSession.created_at,
    deleted_at: null,
  });

  // 2. Seed Soft-Deleted Recent Session (5 days old, soft-deleted 2 days ago, within 30-day retention window)
  const recentSoftDeletedSession: SessionRecord = {
    id: 'ses-softdeleted-recent',
    user_id: userId,
    status: 'ABANDONED',
    score: 0,
    created_at: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
    deleted_at: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago (< 30 days)
  };
  engine.seedSession(recentSoftDeletedSession);

  engine.seedAttempt({
    id: 'att-softdeleted-recent',
    session_id: recentSoftDeletedSession.id,
    user_id: userId,
    question_id: 'q-102',
    selected_index: 0,
    is_correct: false,
    time_taken_ms: 2100,
    created_at: recentSoftDeletedSession.created_at,
    deleted_at: recentSoftDeletedSession.deleted_at,
  });

  // 3. Seed Expired Soft-Deleted Session (45 days old, soft-deleted 35 days ago, older than 30-day retention)
  const expiredSession: SessionRecord = {
    id: 'ses-expired-35d',
    user_id: userId,
    status: 'IN_PROGRESS',
    score: 0,
    created_at: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000),
    deleted_at: new Date(now.getTime() - 35 * 24 * 60 * 60 * 1000), // 35 days ago (> 30 days)
  };
  engine.seedSession(expiredSession);

  engine.seedAttempt({
    id: 'att-expired-35d',
    session_id: expiredSession.id,
    user_id: userId,
    question_id: 'q-103',
    selected_index: 2,
    is_correct: false,
    time_taken_ms: 4800,
    created_at: expiredSession.created_at,
    deleted_at: expiredSession.deleted_at,
  });

  console.log('[STAGE 1] Initial Database State Seeded:');
  console.log(`  Total Sessions in DB: ${engine.getRawCounts().totalSessions} (1 active, 1 recent soft-deleted, 1 expired soft-deleted)`);
  console.log(`  Total Attempts in DB: ${engine.getRawCounts().totalAttempts}`);

  // Test 1: Verify Active View filters out all soft-deleted rows
  console.log('\n--- TEST 1: Active View Query Isolation (deleted_at IS NULL) ---');
  const visibleSessions = engine.queryActiveSessions(userId);
  console.log(`[VERIFY] Active sessions visible to candidate query: ${visibleSessions.length}`);
  if (visibleSessions.length !== 1 || visibleSessions[0].id !== 'ses-active-01') {
    throw new Error(`[FAIL] Soft-deleted sessions leaked into active candidate view! Found: ${JSON.stringify(visibleSessions)}`);
  }
  console.log('[PASS] Active view successfully filters out both soft-deleted sessions.');

  // Test 2: Execute purge_expired_records(30)
  console.log('\n--- TEST 2: Hard-Purge Job Execution (purge_expired_records(30)) ---');
  const purgeResult = engine.purgeExpiredRecords(30);
  console.log(`[PURGE REPORT] Purged Sessions: ${purgeResult.purgedSessions}, Purged Attempts: ${purgeResult.purgedAttempts}`);

  if (purgeResult.purgedSessions !== 1 || purgeResult.purgedAttempts !== 1) {
    throw new Error(`[FAIL] Purge count mismatch! Expected 1 session and 1 attempt purged, got: ${JSON.stringify(purgeResult)}`);
  }
  console.log('[PASS] Hard-purge correctly identified and deleted exactly the 35-day-old expired record.');

  // Test 3: Verify Post-Purge Database State
  console.log('\n--- TEST 3: Post-Purge Table Verification ---');
  const postPurgeCounts = engine.getRawCounts();
  console.log(`[VERIFY] Post-Purge Sessions Remaining: ${postPurgeCounts.totalSessions} (Expected: 2)`);
  console.log(`[VERIFY] Post-Purge Attempts Remaining: ${postPurgeCounts.totalAttempts} (Expected: 2)`);

  if (postPurgeCounts.totalSessions !== 2 || postPurgeCounts.totalAttempts !== 2) {
    throw new Error(`[FAIL] Unexpected table count after purge!`);
  }
  console.log('[PASS] Active session and recent soft-deleted session (retained for proctor review) remain intact.');

  console.log('\n----------------------------------------------------------------');
  console.log('SUMMARY: Retention & Hard-Purge Lifecycle Test: PASS.');
  console.log('================================================================');
}

runRetentionTestSuite().catch((err) => {
  console.error('[FATAL ERROR IN RETENTION TEST]:', err);
  process.exit(1);
});
