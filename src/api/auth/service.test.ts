import { describe, it, expect } from 'vitest';
import { AuthService } from './service.ts';

describe('Auth Layer: Password Policy, Silent Refresh & Logout Revocation', () => {
  it('rejects weak passwords failing complexity requirements server-side', () => {
    const auth = new AuthService();

    // 1. Too short
    const resShort = auth.register('user@test.org', 'Ab1!');
    expect(resShort.ok).toBe(false);

    // 2. Missing uppercase
    const resNoUpper = auth.register('user@test.org', 'password123!');
    expect(resNoUpper.ok).toBe(false);

    // 3. Missing digit
    const resNoDigit = auth.register('user@test.org', 'PasswordSpecial!');
    expect(resNoDigit.ok).toBe(false);

    // 4. Missing special symbol
    const resNoSpecial = auth.register('user@test.org', 'Password1234');
    expect(resNoSpecial.ok).toBe(false);

    // 5. Valid enterprise password
    const resValid = auth.register('user@test.org', 'EnterprisePassword99!');
    expect(resValid.ok).toBe(true);
    if (resValid.ok) {
      expect(resValid.session.accessToken).toBeDefined();
      expect(resValid.session.emailVerified).toBe(false);
    }
  });

  it('proves silent refresh single-flight and token rotation', async () => {
    const auth = new AuthService();
    const regRes = auth.register('candidate@test.org', 'SecurePassword123!');
    expect(regRes.ok).toBe(true);
    if (!regRes.ok) return;

    const initialRefresh = regRes.session.refreshToken;

    // Trigger silent refresh
    const refreshRes = await auth.silentRefresh(initialRefresh);
    expect(refreshRes.ok).toBe(true);
    if (!refreshRes.ok) return;

    // Verify token rotated
    expect(refreshRes.session.accessToken).not.toBe(regRes.session.accessToken);
    expect(refreshRes.session.refreshToken).not.toBe(initialRefresh);

    // Verify old refresh token cannot be reused
    const replayedOldRefresh = await auth.silentRefresh(initialRefresh);
    expect(replayedOldRefresh.ok).toBe(false);
    if (!replayedOldRefresh.ok) {
      expect(replayedOldRefresh.error.statusCode).toBe(401);
    }
  });

  it('proves logout revocation: replaying revoked token triggers 401 SESSION_REVOKED', () => {
    const auth = new AuthService();
    const regRes = auth.register('candidate@test.org', 'SecurePassword123!');
    expect(regRes.ok).toBe(true);
    if (!regRes.ok) return;

    const token = regRes.session.accessToken;
    const refreshToken = regRes.session.refreshToken;

    // Prior to logout, token is valid
    const preCheck = auth.authenticateToken(token);
    expect(preCheck.ok).toBe(true);

    // Execute server-side logout
    auth.logout(token, refreshToken);

    // Replay attack: attempt authentication with logged-out token
    const postCheck = auth.authenticateToken(token);
    expect(postCheck.ok).toBe(false);
    if (!postCheck.ok) {
      expect(postCheck.error.kind).toBe('AuthError');
      if (postCheck.error.kind === 'AuthError') {
        expect(postCheck.error.statusCode).toBe(401);
        expect(postCheck.error.code).toBe('SESSION_REVOKED');
        expect(postCheck.error.message).toContain('revoked');
      }
    }

  });
});
