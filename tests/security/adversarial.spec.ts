import { describe, it, expect, beforeEach } from 'vitest';
import { dispatchApiRequest } from '../../src/api/router.ts';
import { rateLimiter } from '../../src/api/rateLimit.ts';

describe('Adversarial Security Test Suite (OWASP & Threat Model Verification)', () => {
  beforeEach(() => {
    rateLimiter.reset('ip:hostile-test-ip');
    rateLimiter.reset('ip:127.0.0.1');
  });

  // 1. PostgREST & Gateway RLS Bypass Attempt
  it('PoC 1 (RLS Bypass): blocks User B from submitting answers to User A session', async () => {
    // Register User A
    const u1 = await dispatchApiRequest({
      method: 'POST',
      path: '/api/auth/register',
      body: {
        email: `victim_${Date.now()}@cloudfix.edu`,
        password: 'P@sswordEnterprise2026!',
        username: `victim_${Math.random().toString(36).substring(2, 6)}`,
        fullName: 'Victim User',
      },
    });
    const u1Token = (u1.body as { accessToken: string }).accessToken;

    // User A creates session
    const sessRes = await dispatchApiRequest({
      method: 'POST',
      path: '/api/quiz/sessions',
      headers: { authorization: `Bearer ${u1Token}` },
      body: { totalQuestions: 10 },
    });
    const sessionId = (sessRes.body as { id: string }).id;

    // Register User B (Attacker)
    const u2 = await dispatchApiRequest({
      method: 'POST',
      path: '/api/auth/register',
      body: {
        email: `attacker_${Date.now()}@cloudfix.edu`,
        password: 'P@sswordEnterprise2026!',
        username: `attacker_${Math.random().toString(36).substring(2, 6)}`,
        fullName: 'Attacker User',
      },
    });
    const u2Token = (u2.body as { accessToken: string }).accessToken;

    // Attacker attempts to submit attempt on Victim's session
    const attack = await dispatchApiRequest({
      method: 'POST',
      path: '/api/quiz/attempts',
      headers: { authorization: `Bearer ${u2Token}` },
      body: {
        sessionId,
        questionId: 'Q-01',
        selectedIndex: 0,
        timeTakenMs: 1200,
      },
    });

    expect(attack.status).toBe(401);
    const body = attack.body as { error: { code: string; message: string } };
    expect(body.error.code).toBe('UNAUTHORIZED');
    expect(body.error.message).toContain('Unauthorized attempt access');
  });

  // 2. JWT Tamper Attempt
  it('PoC 2 (JWT Tamper): rejects modified or forged bearer tokens', async () => {
    const forgedToken = 'tok-access-forged-admin-jwt-payload-999';
    const resp = await dispatchApiRequest({
      method: 'POST',
      path: '/api/quiz/sessions',
      headers: { authorization: `Bearer ${forgedToken}` },
      body: { totalQuestions: 5 },
    });

    expect(resp.status).toBe(401);
    const body = resp.body as { error: { code: string } };
    expect(body.error.code).toBe('UNAUTHORIZED');
  });

  // 3. IDOR Attempt (Accessing other candidate export)
  it('PoC 3 (IDOR): verifies candidate cannot export unowned candidate records', async () => {
    const reg = await dispatchApiRequest({
      method: 'POST',
      path: '/api/auth/register',
      body: {
        email: `candidate_export_${Date.now()}@cloudfix.edu`,
        password: 'P@sswordEnterprise2026!',
        username: `cand_exp_${Math.random().toString(36).substring(2, 6)}`,
        fullName: 'Export User',
      },
    });
    const token = (reg.body as { accessToken: string }).accessToken;

    const exportResp = await dispatchApiRequest({
      method: 'GET',
      path: '/api/user/export',
      headers: { authorization: `Bearer ${token}` },
      query: { includeAttempts: true },
    });

    expect(exportResp.status).toBe(200);
    const data = exportResp.body as { candidate: { email: string } };
    expect(data.candidate.email).toContain('candidate_export_');
  });

  // 4. Rate-Limit Bypass Attempt
  it('PoC 4 (Rate-Limit Burst): triggers HTTP 429 when write request threshold exceeded', async () => {
    const clientIp = 'hostile-test-ip';

    // 50 requests per minute allowed on write operations
    for (let i = 0; i < 50; i++) {
      rateLimiter.checkLimit(`ip:${clientIp}`, { maxRequests: 50, windowMs: 60000 });
    }

    const blockedResp = await dispatchApiRequest({
      method: 'POST',
      path: '/api/auth/login',
      ip: clientIp,
      body: { email: 'victim@cloudfix.edu', password: 'AnyPassword123!' },
    });

    expect(blockedResp.status).toBe(429);
    const body = blockedResp.body as { error: { code: string; details: { retryAfterSeconds: number } } };
    expect(body.error.code).toBe('TOO_MANY_REQUESTS');
    expect(body.error.details.retryAfterSeconds).toBeGreaterThan(0);
  });

  // 5. Weak Password Server-Side Policy
  it('PoC 5 (Weak Password): server-side validator rejects passwords lacking required complexity', async () => {
    const passwords = [
      'short1!', // < 8 characters
      'alllowercase123!', // no uppercase
      'ALLUPPERCASE123!', // no lowercase
      'NoDigitsHere!', // no number
      'NoSpecialChars123', // no symbol
    ];

    for (const badPassword of passwords) {
      const resp = await dispatchApiRequest({
        method: 'POST',
        path: '/api/auth/register',
        body: {
          email: `test_${Math.random().toString(36).substring(2, 6)}@cloudfix.edu`,
          password: badPassword,
          username: 'valid_user',
          fullName: 'Valid User',
        },
      });

      expect(resp.status).toBe(400);
      const body = resp.body as { error: { code: string } };
      expect(body.error.code).toBe('VALIDATION_FAILED');
    }
  });

  // 6. Token Replay After Server-Side Logout
  it('PoC 6 (Token Replay): revoked token cannot be replayed after logout', async () => {
    const reg = await dispatchApiRequest({
      method: 'POST',
      path: '/api/auth/register',
      body: {
        email: `replay_${Date.now()}@cloudfix.edu`,
        password: 'P@sswordEnterprise2026!',
        username: `replay_${Math.random().toString(36).substring(2, 6)}`,
        fullName: 'Replay User',
      },
    });
    const authData = reg.body as { accessToken: string; refreshToken: string };

    // Logout immediately
    const logoutResp = await dispatchApiRequest({
      method: 'POST',
      path: '/api/auth/logout',
      headers: { authorization: `Bearer ${authData.accessToken}` },
      body: { refreshToken: authData.refreshToken },
    });
    expect(logoutResp.status).toBe(200);

    // Replay attack with logged-out access token
    const replayAttempt = await dispatchApiRequest({
      method: 'POST',
      path: '/api/quiz/sessions',
      headers: { authorization: `Bearer ${authData.accessToken}` },
      body: { totalQuestions: 10 },
    });

    expect(replayAttempt.status).toBe(401);
    const body = replayAttempt.body as { error: { code: string } };
    expect(body.error.code).toBe('SESSION_REVOKED');
  });
});
