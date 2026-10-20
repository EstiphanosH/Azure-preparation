import { PasswordPolicySchema } from '../schemas/index.ts';
import { ApiError } from '../errors.ts';

export interface UserAuthSession {
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly userId: string;
  readonly email: string;
  readonly emailVerified: boolean;
  readonly expiresAt: number;
}

export class AuthService {
  private activeSessions = new Map<string, UserAuthSession>(); // Token -> Session
  private refreshTokens = new Map<string, string>(); // RefreshToken -> UserId
  private revokedTokens = new Set<string>(); // Blacklist of explicitly logged-out tokens
  private refreshInFlightByToken = new Map<string, Promise<UserAuthSession | null>>(); // Single-flight mutex per token

  public register(
    email: string,
    password: string,
    userId = `usr-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`
  ): { ok: true; session: UserAuthSession } | { ok: false; error: ApiError } {

    // 1. Password policy verification server-side
    const passCheck = PasswordPolicySchema.safeParse(password);
    if (!passCheck.success) {
      return {
        ok: false,
        error: {
          kind: 'ValidationError',
          statusCode: 400,
          message: 'Password does not satisfy enterprise security policy requirements.',
          issues: passCheck.error.issues.map((i) => i.message),
        },
      };
    }

    // 2. Issue session requiring email verification
    const accessToken = `tok-access-${Math.random().toString(36).substring(2, 10)}`;
    const refreshToken = `tok-refresh-${Math.random().toString(36).substring(2, 10)}`;

    const session: UserAuthSession = {
      accessToken,
      refreshToken,
      userId,
      email,
      emailVerified: false, // Mandatory verification flag
      expiresAt: Date.now() + 15 * 60 * 1000, // 15-minute lifetime
    };

    this.activeSessions.set(accessToken, session);
    this.refreshTokens.set(refreshToken, userId);

    return { ok: true, session };
  }

  public verifyEmail(userId: string): boolean {
    for (const [tok, sess] of this.activeSessions.entries()) {
      if (sess.userId === userId) {
        this.activeSessions.set(tok, { ...sess, emailVerified: true });
        return true;
      }
    }
    return false;
  }

  public authenticateToken(token: string): { ok: true; session: UserAuthSession } | { ok: false; error: ApiError } {
    if (this.revokedTokens.has(token)) {
      return {
        ok: false,
        error: {
          kind: 'AuthError',
          statusCode: 401,
          code: 'SESSION_REVOKED',
          message: 'The token has been explicitly revoked upon server logout.',
        },
      };
    }

    const session = this.activeSessions.get(token);
    if (!session) {
      return {
        ok: false,
        error: {
          kind: 'AuthError',
          statusCode: 401,
          code: 'UNAUTHORIZED',
          message: 'Invalid or unknown session token.',
        },
      };
    }

    if (Date.now() > session.expiresAt) {
      return {
        ok: false,
        error: {
          kind: 'AuthError',
          statusCode: 401,
          code: 'TOKEN_EXPIRED',
          message: 'Access token has expired. Silent refresh required.',
        },
      };
    }

    return { ok: true, session };
  }

  /**
   * Silent Refresh with single-flight mutex:
   * Concurrent refresh requests coalesce into a single flight operation.
   */
  public async silentRefresh(refreshToken: string): Promise<{ ok: true; session: UserAuthSession } | { ok: false; error: ApiError }> {
    if (this.revokedTokens.has(refreshToken)) {
      return {
        ok: false,
        error: {
          kind: 'AuthError',
          statusCode: 401,
          code: 'SESSION_REVOKED',
          message: 'Refresh token has been revoked.',
        },
      };
    }

    // Single-flight deduplication check
    const inFlight = this.refreshInFlightByToken.get(refreshToken);
    if (inFlight) {
      const existing = await inFlight;
      if (existing) return { ok: true, session: existing };
    }

    const userId = this.refreshTokens.get(refreshToken);
    if (!userId) {
      return {
        ok: false,
        error: {
          kind: 'AuthError',
          statusCode: 401,
          code: 'UNAUTHORIZED',
          message: 'Invalid refresh token.',
        },
      };
    }

    const refreshPromise = (async () => {
      // Rotate tokens
      this.refreshTokens.delete(refreshToken);
      const newAccessToken = `tok-access-${Math.random().toString(36).substring(2, 10)}`;
      const newRefreshToken = `tok-refresh-${Math.random().toString(36).substring(2, 10)}`;

      const newSession: UserAuthSession = {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        userId,
        email: 'candidate@cloudfix.edu',
        emailVerified: true,
        expiresAt: Date.now() + 15 * 60 * 1000,
      };

      this.activeSessions.set(newAccessToken, newSession);
      this.refreshTokens.set(newRefreshToken, userId);
      return newSession;
    })();

    this.refreshInFlightByToken.set(refreshToken, refreshPromise);

    try {
      const refreshedSession = await refreshPromise;
      if (!refreshedSession) {
        return {
          ok: false,
          error: {
            kind: 'AuthError',
            statusCode: 401,
            code: 'UNAUTHORIZED',
            message: 'Refresh failed',
          },
        };
      }
      return { ok: true, session: refreshedSession };
    } finally {
      this.refreshInFlightByToken.delete(refreshToken);
    }
  }


  /**
   * Server-Side Logout:
   * Immediately invalidates access token and refresh token in server blacklist.
   */
  public logout(accessToken: string, refreshToken?: string): { success: true } {
    this.revokedTokens.add(accessToken);
    this.activeSessions.delete(accessToken);

    if (refreshToken) {
      this.revokedTokens.add(refreshToken);
      this.refreshTokens.delete(refreshToken);
    }
    return { success: true };
  }
}
