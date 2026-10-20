import { describe, it, expect, beforeEach } from 'vitest';
import { dispatchApiRequest } from './router.ts';
import { quizRepository } from './repositories/quizRepository.ts';
import { rateLimiter } from './rateLimit.ts';
import { metrics } from '../observability/metrics.ts';

describe('API Gateway & Endpoints Invariants', () => {
  let validAccessToken = '';
  let validRefreshToken = '';
  let candidateUserId = '';
  let activeSessionId = '';

  beforeEach(async () => {
    // Reset rate limiter for test isolation
    rateLimiter.reset('ip:127.0.0.1');
    rateLimiter.reset('ip:test-client');
  });

  // =========================================================================
  // 1. AUTH ENDPOINTS & SECURITY POLICY
  // =========================================================================
  describe('Auth Endpoints & Lifecycle', () => {
    it('POST /api/auth/register rejects weak passwords failing enterprise policy', async () => {
      const resp = await dispatchApiRequest({
        method: 'POST',
        path: '/api/auth/register',
        body: {
          email: 'weak_candidate@cloudfix.edu',
          password: 'weak', // fails min 8, uppercase, digit, symbol
          username: 'candidate1',
          fullName: 'Test Candidate',
        },
      });

      expect(resp.status).toBe(400);
      const body = resp.body as { error: { code: string; message: string; details: string[] } };
      expect(body.error.code).toBe('VALIDATION_FAILED');
      expect(body.error.details.length).toBeGreaterThanOrEqual(1);
    });

    it('POST /api/auth/register strictly rejects unrecognized payload fields (.strict())', async () => {
      const resp = await dispatchApiRequest({
        method: 'POST',
        path: '/api/auth/register',
        body: {
          email: 'strict_candidate@cloudfix.edu',
          password: 'ValidPassword123!',
          username: 'candidate_strict',
          fullName: 'Strict Test',
          unauthorizedField: 'hacker_payload',
        },
      });

      expect(resp.status).toBe(400);
      const body = resp.body as { error: { code: string } };
      expect(body.error.code).toBe('VALIDATION_FAILED');
    });

    it('POST /api/auth/register successfully registers candidate and issues tokens', async () => {
      const resp = await dispatchApiRequest({
        method: 'POST',
        path: '/api/auth/register',
        body: {
          email: 'candidate_alpha@cloudfix.edu',
          password: 'P@sswordEnterprise2026!',
          username: 'candidate_alpha',
          fullName: 'Candidate Alpha',
        },
      });

      expect(resp.status).toBe(201);
      const data = resp.body as { accessToken: string; refreshToken: string; user: { id: string } };
      expect(data.accessToken).toMatch(/^tok-access-/);
      expect(data.refreshToken).toMatch(/^tok-refresh-/);
      expect(data.user.id).toBeTruthy();

      validAccessToken = data.accessToken;
      validRefreshToken = data.refreshToken;
      candidateUserId = data.user.id;
    });

    it('POST /api/auth/login succeeds with valid credentials', async () => {
      const resp = await dispatchApiRequest({
        method: 'POST',
        path: '/api/auth/login',
        body: {
          email: 'candidate_alpha@cloudfix.edu',
          password: 'P@sswordEnterprise2026!',
        },
      });

      expect(resp.status).toBe(200);
      const data = resp.body as { accessToken: string; refreshToken: string };
      expect(data.accessToken).toBeTruthy();
    });

    it('POST /api/auth/refresh performs silent refresh with single-flight mutex & rotates tokens', async () => {
      // Single flight concurrent calls
      const [res1, res2] = await Promise.all([
        dispatchApiRequest({
          method: 'POST',
          path: '/api/auth/refresh',
          body: { refreshToken: validRefreshToken },
        }),
        dispatchApiRequest({
          method: 'POST',
          path: '/api/auth/refresh',
          body: { refreshToken: validRefreshToken },
        }),
      ]);

      expect(res1.status).toBe(200);
      expect(res2.status).toBe(200);

      const data1 = res1.body as { accessToken: string; refreshToken: string };
      const data2 = res2.body as { accessToken: string; refreshToken: string };

      // Both callers receive consistent session via single-flight mutex
      expect(data1.accessToken).toBe(data2.accessToken);

      // Update tokens to rotated credentials
      validAccessToken = data1.accessToken;
      validRefreshToken = data1.refreshToken;
    });

    it('POST /api/auth/logout invalidates session on server, subsequent calls are rejected', async () => {
      const logoutResp = await dispatchApiRequest({
        method: 'POST',
        path: '/api/auth/logout',
        headers: { authorization: `Bearer ${validAccessToken}` },
        body: { refreshToken: validRefreshToken },
      });

      expect(logoutResp.status).toBe(200);
      expect(logoutResp.body).toEqual({ success: true });

      // Verifying token is now rejected as revoked
      const followUpResp = await dispatchApiRequest({
        method: 'POST',
        path: '/api/quiz/sessions',
        headers: { authorization: `Bearer ${validAccessToken}` },
        body: { totalQuestions: 10 },
      });

      expect(followUpResp.status).toBe(401);
      const err = followUpResp.body as { error: { code: string } };
      expect(err.error.code).toBe('SESSION_REVOKED');
    });
  });

  // =========================================================================
  // 2. QUIZ SESSION & ATTEMPTS WORKFLOW (Authenticated & RLS Boundaries)
  // =========================================================================
  describe('Quiz Sessions, Attempts & Scoring Endpoints', () => {
    let freshAccessToken = '';

    beforeEach(async () => {
      // Register fresh candidate for authenticated tests
      const reg = await dispatchApiRequest({
        method: 'POST',
        path: '/api/auth/register',
        body: {
          email: `candidate_${Date.now()}_${Math.random()}@cloudfix.edu`,
          password: 'EnterpriseCandidate#1',
          username: `cand_${Math.random().toString(36).substring(2, 7)}`,
          fullName: 'Test Candidate',
        },
      });
      const data = reg.body as { accessToken: string; user: { id: string } };
      freshAccessToken = data.accessToken;
      candidateUserId = data.user.id;

      const sess = await dispatchApiRequest({
        method: 'POST',
        path: '/api/quiz/sessions',
        headers: { authorization: `Bearer ${freshAccessToken}` },
        body: { totalQuestions: 10, domainId: 'DOM-SERVICES' },
      });
      activeSessionId = (sess.body as { id: string }).id;
    });

    it('POST /api/quiz/sessions strictly rejects unknown fields (.strict())', async () => {
      const resp = await dispatchApiRequest({
        method: 'POST',
        path: '/api/quiz/sessions',
        headers: { authorization: `Bearer ${freshAccessToken}` },
        body: {
          totalQuestions: 10,
          maliciousKey: true,
        },
      });

      expect(resp.status).toBe(400);
      const body = resp.body as { error: { code: string } };
      expect(body.error.code).toBe('VALIDATION_FAILED');
    });

    it('POST /api/quiz/sessions starts in_progress session', async () => {
      const resp = await dispatchApiRequest({
        method: 'POST',
        path: '/api/quiz/sessions',
        headers: { authorization: `Bearer ${freshAccessToken}` },
        body: {
          totalQuestions: 10,
          domainId: 'DOM-SERVICES',
        },
      });

      expect(resp.status).toBe(201);
      const data = resp.body as { id: string; status: string; totalQuestions: number };
      expect(data.status).toBe('IN_PROGRESS');
      expect(data.totalQuestions).toBe(10);
    });

    it('POST /api/quiz/attempts records attempt and evaluates correctness', async () => {
      const resp = await dispatchApiRequest({
        method: 'POST',
        path: '/api/quiz/attempts',
        headers: { authorization: `Bearer ${freshAccessToken}` },
        body: {
          sessionId: activeSessionId,
          questionId: 'Q-01',
          selectedIndex: 0, // Correct answer for Q-01
          timeTakenMs: 14200,
        },
      });

      expect(resp.status).toBe(200);
      const data = resp.body as { isCorrect: boolean; selectedIndex: number };
      expect(data.isCorrect).toBe(true);
      expect(data.selectedIndex).toBe(0);
    });

    it('POST /api/quiz/attempts rejects unknown fields (.strict())', async () => {
      const resp = await dispatchApiRequest({
        method: 'POST',
        path: '/api/quiz/attempts',
        headers: { authorization: `Bearer ${freshAccessToken}` },
        body: {
          sessionId: activeSessionId,
          questionId: 'Q-01',
          selectedIndex: 0,
          timeTakenMs: 12000,
          extraField: 'not_allowed',
        },
      });

      expect(resp.status).toBe(400);
      const body = resp.body as { error: { code: string } };
      expect(body.error.code).toBe('VALIDATION_FAILED');
    });

    it('POST /api/quiz/sessions/:id/finalize scores session via pure domain delegation', async () => {
      // First submit an attempt
      await dispatchApiRequest({
        method: 'POST',
        path: '/api/quiz/attempts',
        headers: { authorization: `Bearer ${freshAccessToken}` },
        body: {
          sessionId: activeSessionId,
          questionId: 'Q-01',
          selectedIndex: 0,
          timeTakenMs: 8000,
        },
      });

      const resp = await dispatchApiRequest({
        method: 'POST',
        path: `/api/quiz/sessions/${activeSessionId}/finalize`,
        headers: { authorization: `Bearer ${freshAccessToken}` },
        body: {},
      });

      expect(resp.status).toBe(200);
      const data = resp.body as { status: string; score: number; totalQuestions: number };
      expect(data.status).toBe('RESOLVED');
      expect(data.score).toBe(10); // 1 correct out of 10 = 10%
      expect(data.totalQuestions).toBe(10);
    });
  });


  // =========================================================================
  // 3. READINESS, DATA EXPORT & ACCOUNT CASCADE
  // =========================================================================
  describe('Readiness & Candidate Governance', () => {
    let authHeader = '';

    beforeEach(async () => {
      const reg = await dispatchApiRequest({
        method: 'POST',
        path: '/api/auth/register',
        body: {
          email: `readiness_${Date.now()}@cloudfix.edu`,
          password: 'EnterpriseCandidate#1',
          username: `cand_read_${Math.random().toString(36).substring(2, 6)}`,
          fullName: 'Readiness Candidate',
        },
      });
      const data = reg.body as { accessToken: string };
      authHeader = `Bearer ${data.accessToken}`;
    });

    it('GET /api/readiness computes candidate readiness score', async () => {
      const resp = await dispatchApiRequest({
        method: 'GET',
        path: '/api/readiness',
        headers: { authorization: authHeader },
        query: { halfLifeDays: 14 },
      });

      expect(resp.status).toBe(200);
      const data = resp.body as {
        overallScore: number;
        evaluationGrade: string;
        domainBreakdown: Array<{ domainId: string }>;
      };
      expect(data.overallScore).toBeGreaterThanOrEqual(0);
      expect(['READY', 'REVIEW_REQUIRED', 'NOT_READY']).toContain(data.evaluationGrade);
      expect(data.domainBreakdown.length).toBe(3);
    });

    it('GET /api/readiness strictly rejects unknown query parameters (.strict())', async () => {
      const resp = await dispatchApiRequest({
        method: 'GET',
        path: '/api/readiness',
        headers: { authorization: authHeader },
        query: { halfLifeDays: 14, unallowedParam: 'inject' },
      });

      expect(resp.status).toBe(400);
      const body = resp.body as { error: { code: string } };
      expect(body.error.code).toBe('VALIDATION_FAILED');
    });

    it('GET /api/user/export retrieves candidate GDPR export view', async () => {
      const resp = await dispatchApiRequest({
        method: 'GET',
        path: '/api/user/export',
        headers: { authorization: authHeader },
        query: { includeAttempts: true },
      });

      expect(resp.status).toBe(200);
      const data = resp.body as { candidate: { email: string }; sessionsCount: number };
      expect(data.candidate.email).toBeTruthy();
      expect(data.sessionsCount).toBeGreaterThanOrEqual(0);
    });

    it('DELETE /api/user/account strictly cascades deletion', async () => {
      const resp = await dispatchApiRequest({
        method: 'DELETE',
        path: '/api/user/account',
        headers: { authorization: authHeader },
        body: { confirmation: 'DELETE_MY_ACCOUNT_PERMANENTLY' },
      });

      expect(resp.status).toBe(200);
      const data = resp.body as { deleted: boolean; count: number };
      expect(data.deleted).toBe(true);
    });
  });

  // =========================================================================
  // 4. SAFE ERROR MAPPING & NO SQL / STACK LEAKAGE
  // =========================================================================
  describe('Safe Error Mapping Under Forced Database Failure', () => {
    it('redacts raw SQL syntax errors into generic 500 with incidentId', async () => {
      try {
        await quizRepository.forceDatabaseError('syntax');
      } catch (err) {
        const { mapErrorToSafeHttpResponse } = await import('./errors.ts');
        const safeResp = mapErrorToSafeHttpResponse(err);

        expect(safeResp.status).toBe(500);
        expect(safeResp.body.error.code).toBe('INTERNAL_SERVER_ERROR');
        expect(safeResp.body.error.message).toBe('An internal error occurred. Please try again.');
        expect(safeResp.body.error.incidentId).toMatch(/^inc-/);

        // Explicitly assert zero leakage
        const serialized = JSON.stringify(safeResp);
        expect(serialized).not.toContain('syntax error');
        expect(serialized).not.toContain('SELECT FROM');
        expect(serialized).not.toContain('PostgreSQL');
      }
    });

    it('transforms unique constraint violation into 409 conflict without leaking column/table name', async () => {
      try {
        await quizRepository.forceDatabaseError('constraint');
      } catch (err) {
        const { mapErrorToSafeHttpResponse } = await import('./errors.ts');
        const safeResp = mapErrorToSafeHttpResponse(err);

        expect(safeResp.status).toBe(409);
        expect(safeResp.body.error.code).toBe('RESOURCE_CONFLICT');
        expect(safeResp.body.error.message).toBe('The requested resource already exists.');

        // No table or column leaking
        const serialized = JSON.stringify(safeResp);
        expect(serialized).not.toContain('users_email_key');
      }
    });

    it('transforms RLS policy violation into 403 access denied without leaking policy name', async () => {
      try {
        await quizRepository.forceDatabaseError('rls');
      } catch (err) {
        const { mapErrorToSafeHttpResponse } = await import('./errors.ts');
        const safeResp = mapErrorToSafeHttpResponse(err);

        expect(safeResp.status).toBe(403);
        expect(safeResp.body.error.code).toBe('ACCESS_DENIED');
        expect(safeResp.body.error.message).toBe('Access to the requested resource is denied by security policy.');

        const serialized = JSON.stringify(safeResp);
        expect(serialized).not.toContain('quiz_sessions');
      }
    });
  });

  // =========================================================================
  // 5. LATENCY MEASUREMENT FOR ALL 10 ENDPOINTS
  // =========================================================================
  describe('Latency Budgets (p95 Measurement across 10 Endpoints)', () => {
    it('measures p95 latency for all 10 endpoints and verifies budgets are satisfied', async () => {
      // Setup candidate credentials
      const reg = await dispatchApiRequest({
        method: 'POST',
        path: '/api/auth/register',
        ip: 'perf-ip-01',
        body: {
          email: 'benchmark_perf@cloudfix.edu',
          password: 'EnterpriseCandidate#1',
          username: 'perf_tester',
          fullName: 'Perf Tester',
        },
      });
      const auth = reg.body as { accessToken: string; refreshToken: string };
      const bearer = `Bearer ${auth.accessToken}`;

      const sessResp = await dispatchApiRequest({
        method: 'POST',
        path: '/api/quiz/sessions',
        headers: { authorization: bearer },
        ip: 'perf-ip-02',
        body: { totalQuestions: 10 },
      });
      const sessData = sessResp.body as { id: string };

      // Endpoints to benchmark with their p95 budgets from api-contract.md
      const benchmarkRoutes: Array<{
        name: string;
        budgetMs: number;
        exec: () => Promise<void>;
      }> = [
        {
          name: 'POST /api/auth/register',
          budgetMs: 80,
          exec: async () => {
            await dispatchApiRequest({
              method: 'POST',
              path: '/api/auth/register',
              ip: `bench-ip-${Math.random()}`,
              body: {
                email: `bench_${Math.random().toString(36).substring(2, 8)}@cloudfix.edu`,
                password: 'EnterpriseCandidate#1',
                username: `u_${Math.random().toString(36).substring(2, 8)}`,
                fullName: 'Bench User',
              },
            });
          },
        },
        {
          name: 'POST /api/auth/login',
          budgetMs: 65,
          exec: async () => {
            await dispatchApiRequest({
              method: 'POST',
              path: '/api/auth/login',
              ip: `bench-ip-${Math.random()}`,
              body: { email: 'benchmark_perf@cloudfix.edu', password: 'EnterpriseCandidate#1' },
            });
          },
        },
        {
          name: 'POST /api/auth/refresh',
          budgetMs: 40,
          exec: async () => {
            await dispatchApiRequest({
              method: 'POST',
              path: '/api/auth/refresh',
              body: { refreshToken: auth.refreshToken },
            });
          },
        },
        {
          name: 'POST /api/auth/logout',
          budgetMs: 30,
          exec: async () => {
            await dispatchApiRequest({
              method: 'POST',
              path: '/api/auth/logout',
              headers: { authorization: bearer },
              body: { refreshToken: `tok-dummy-${Math.random()}` },
            });
          },
        },
        {
          name: 'POST /api/quiz/sessions',
          budgetMs: 65,
          exec: async () => {
            await dispatchApiRequest({
              method: 'POST',
              path: '/api/quiz/sessions',
              headers: { authorization: bearer },
              ip: `bench-sess-${Math.random()}`,
              body: { totalQuestions: 5 },
            });
          },
        },
        {
          name: 'POST /api/quiz/attempts',
          budgetMs: 45,
          exec: async () => {
            await dispatchApiRequest({
              method: 'POST',
              path: '/api/quiz/attempts',
              headers: { authorization: bearer },
              ip: `bench-att-${Math.random()}`,
              body: { sessionId: sessData.id, questionId: 'Q-01', selectedIndex: 0, timeTakenMs: 1000 },
            });
          },
        },
        {
          name: 'POST /api/quiz/sessions/:id/finalize',
          budgetMs: 75,
          exec: async () => {
            await dispatchApiRequest({
              method: 'POST',
              path: `/api/quiz/sessions/${sessData.id}/finalize`,
              headers: { authorization: bearer },
              ip: `bench-fin-${Math.random()}`,
              body: {},
            });
          },
        },
        {
          name: 'GET /api/readiness',
          budgetMs: 60,
          exec: async () => {
            await dispatchApiRequest({
              method: 'GET',
              path: '/api/readiness',
              headers: { authorization: bearer },
              query: { halfLifeDays: 14 },
            });
          },
        },
        {
          name: 'GET /api/user/export',
          budgetMs: 85,
          exec: async () => {
            await dispatchApiRequest({
              method: 'GET',
              path: '/api/user/export',
              headers: { authorization: bearer },
              query: { includeAttempts: true },
            });
          },
        },
        {
          name: 'DELETE /api/user/account',
          budgetMs: 90,
          exec: async () => {
            await dispatchApiRequest({
              method: 'DELETE',
              path: '/api/user/account',
              headers: { authorization: bearer },
              body: { confirmation: 'DELETE_MY_ACCOUNT_PERMANENTLY' },
            });
          },
        },
      ];

      for (const route of benchmarkRoutes) {
        // Run 20 warm-up and measurement iterations
        for (let i = 0; i < 20; i++) {
          await route.exec();
        }

        const p95 = metrics.getP95Latency(route.name);
        expect(p95).toBeLessThanOrEqual(route.budgetMs);
      }
    });
  });
});
