import { AuthService } from '../auth/service.ts';
import {
  RegisterRequestSchema,
  LoginRequestSchema,
  RefreshRequestSchema,
  LogoutRequestSchema,
  AuthSessionResponseSchema,
  LogoutResponseSchema,
} from '../schemas/index.ts';
import { ApiError } from '../errors.ts';
import { z } from 'zod';
import { quizRepository } from '../repositories/quizRepository.ts';
import { makeUserId } from '../../domain/model/Ids.ts';

export const authService = new AuthService();

export class AuthUseCase {
  constructor(private service: AuthService = authService) {}

  public async register(
    rawInput: unknown
  ): Promise<{ ok: true; data: z.infer<typeof AuthSessionResponseSchema> } | { ok: false; error: ApiError }> {
    const parsed = RegisterRequestSchema.safeParse(rawInput);
    if (!parsed.success) {
      const issues = parsed.error.issues.map((i) => i.message);
      const detailedMessage = issues.length > 0 ? issues.join('. ') : 'Invalid registration payload.';
      return {
        ok: false,
        error: {
          kind: 'ValidationError',
          statusCode: 400,
          message: detailedMessage,
          issues,
        },
      };
    }

    const result = this.service.register(parsed.data.email, parsed.data.password);
    if (!result.ok) {
      return result;
    }

    quizRepository.setUserMeta(makeUserId(result.session.userId), {
      email: parsed.data.email,
      username: parsed.data.username,
    });

    const response = AuthSessionResponseSchema.parse({
      accessToken: result.session.accessToken,
      refreshToken: result.session.refreshToken,
      expiresIn: Math.floor((result.session.expiresAt - Date.now()) / 1000),
      user: {
        id: result.session.userId,
        email: result.session.email,
        username: parsed.data.username,
      },
    });

    return { ok: true, data: response };
  }

  public async login(
    rawInput: unknown
  ): Promise<{ ok: true; data: z.infer<typeof AuthSessionResponseSchema> } | { ok: false; error: ApiError }> {
    const parsed = LoginRequestSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        ok: false,
        error: {
          kind: 'ValidationError',
          statusCode: 400,
          message: 'Invalid login payload.',
          issues: parsed.error.issues.map((i) => i.message),
        },
      };
    }

    // Default simulation candidate for login
    const result = this.service.register(parsed.data.email, parsed.data.password, `usr-${Math.abs(parsed.data.email.split('').reduce((a, b) => a + b.charCodeAt(0), 0))}`);
    if (!result.ok) {
      return result;
    }

    const response = AuthSessionResponseSchema.parse({
      accessToken: result.session.accessToken,
      refreshToken: result.session.refreshToken,
      expiresIn: 900,
      user: {
        id: result.session.userId,
        email: result.session.email,
        username: parsed.data.email.split('@')[0] || 'candidate',
      },
    });

    return { ok: true, data: response };
  }

  public async refresh(
    rawInput: unknown
  ): Promise<{ ok: true; data: z.infer<typeof AuthSessionResponseSchema> } | { ok: false; error: ApiError }> {
    const parsed = RefreshRequestSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        ok: false,
        error: {
          kind: 'ValidationError',
          statusCode: 400,
          message: 'Invalid refresh payload.',
          issues: parsed.error.issues.map((i) => i.message),
        },
      };
    }

    const result = await this.service.silentRefresh(parsed.data.refreshToken);
    if (!result.ok) {
      return result;
    }

    const response = AuthSessionResponseSchema.parse({
      accessToken: result.session.accessToken,
      refreshToken: result.session.refreshToken,
      expiresIn: 900,
      user: {
        id: result.session.userId,
        email: result.session.email,
        username: 'candidate',
      },
    });

    return { ok: true, data: response };
  }

  public async logout(
    rawInput: unknown,
    bearerToken?: string
  ): Promise<{ ok: true; data: z.infer<typeof LogoutResponseSchema> } | { ok: false; error: ApiError }> {
    const parsed = LogoutRequestSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        ok: false,
        error: {
          kind: 'ValidationError',
          statusCode: 400,
          message: 'Invalid logout payload.',
          issues: parsed.error.issues.map((i) => i.message),
        },
      };
    }

    if (bearerToken) {
      this.service.logout(bearerToken, parsed.data.refreshToken);
    } else {
      this.service.logout(parsed.data.refreshToken, parsed.data.refreshToken);
    }

    const response = LogoutResponseSchema.parse({ success: true });
    return { ok: true, data: response };
  }
}

export const authUseCase = new AuthUseCase();
