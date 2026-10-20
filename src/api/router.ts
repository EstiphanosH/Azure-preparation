import { authUseCase, authService } from './useCases/authUseCase.ts';
import { quizUseCase } from './useCases/quizUseCase.ts';
import { readinessUseCase } from './useCases/readinessUseCase.ts';
import { candidateDataUseCase } from './useCases/candidateDataUseCase.ts';
import { mapErrorToSafeHttpResponse } from './errors.ts';
import { rateLimiter } from './rateLimit.ts';
import { logger } from '../observability/logger.ts';
import { metrics } from '../observability/metrics.ts';

export interface ApiHttpRequest {
  readonly method: 'GET' | 'POST' | 'DELETE' | 'PUT' | 'PATCH';
  readonly path: string;
  readonly headers?: Record<string, string | undefined>;
  readonly body?: unknown;
  readonly query?: Record<string, unknown>;
  readonly ip?: string;
}

export interface ApiHttpResponse {
  readonly status: number;
  readonly headers: Record<string, string>;
  readonly body: unknown;
}

export async function dispatchApiRequest(req: ApiHttpRequest): Promise<ApiHttpResponse> {
  const startTime = performance.now();
  const correlationId =
    req.headers?.['x-correlation-id'] ||
    `corr-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
  const clientIp = req.ip || req.headers?.['x-forwarded-for'] || '127.0.0.1';

  let normalizedRoute = req.path;
  let responseStatus = 200;

  try {
    // Standardize path (remove trailing slash)
    const cleanPath = req.path.replace(/\/+$/, '') || '/';

    // 1. Rate Limiting for Write Operations
    if (req.method === 'POST' || req.method === 'DELETE') {
      const ipRateCheck = rateLimiter.checkLimit(`ip:${clientIp}`, { maxRequests: 50, windowMs: 60000 });
      if (!ipRateCheck.ok) {
        const safeResp = mapErrorToSafeHttpResponse(ipRateCheck.error);
        responseStatus = safeResp.status;
        return {
          status: safeResp.status,
          headers: { 'Content-Type': 'application/json', 'x-correlation-id': correlationId },
          body: safeResp.body,
        };
      }
    }

    // 2. Public Auth Routes
    if (req.method === 'POST' && cleanPath === '/api/auth/register') {
      normalizedRoute = 'POST /api/auth/register';
      const result = await authUseCase.register(req.body);
      if (!result.ok) {
        const safe = mapErrorToSafeHttpResponse(result.error);
        responseStatus = safe.status;
        return { status: safe.status, headers: { 'x-correlation-id': correlationId }, body: safe.body };
      }
      return { status: 201, headers: { 'x-correlation-id': correlationId }, body: result.data };
    }

    if (req.method === 'POST' && cleanPath === '/api/auth/login') {
      normalizedRoute = 'POST /api/auth/login';
      const result = await authUseCase.login(req.body);
      if (!result.ok) {
        const safe = mapErrorToSafeHttpResponse(result.error);
        responseStatus = safe.status;
        return { status: safe.status, headers: { 'x-correlation-id': correlationId }, body: safe.body };
      }
      return { status: 200, headers: { 'x-correlation-id': correlationId }, body: result.data };
    }

    if (req.method === 'POST' && cleanPath === '/api/auth/refresh') {
      normalizedRoute = 'POST /api/auth/refresh';
      const result = await authUseCase.refresh(req.body);
      if (!result.ok) {
        const safe = mapErrorToSafeHttpResponse(result.error);
        responseStatus = safe.status;
        return { status: safe.status, headers: { 'x-correlation-id': correlationId }, body: safe.body };
      }
      return { status: 200, headers: { 'x-correlation-id': correlationId }, body: result.data };
    }

    if (req.method === 'POST' && cleanPath === '/api/auth/logout') {
      normalizedRoute = 'POST /api/auth/logout';
      const authHeader = req.headers?.['authorization'] || '';
      const bearerToken = authHeader.toLowerCase().startsWith('bearer ') ? authHeader.substring(7).trim() : undefined;
      const result = await authUseCase.logout(req.body, bearerToken);
      if (!result.ok) {
        const safe = mapErrorToSafeHttpResponse(result.error);
        responseStatus = safe.status;
        return { status: safe.status, headers: { 'x-correlation-id': correlationId }, body: safe.body };
      }
      return { status: 200, headers: { 'x-correlation-id': correlationId }, body: result.data };
    }

    // 3. Authenticated Routes Verification (RLS & Identity Context)
    const authHeader = req.headers?.['authorization'] || '';
    if (!authHeader.toLowerCase().startsWith('bearer ')) {
      const safe = mapErrorToSafeHttpResponse({
        kind: 'AuthError',
        statusCode: 401,
        code: 'UNAUTHORIZED',
        message: 'Missing or malformed Authorization Bearer header.',
      });
      responseStatus = safe.status;
      return { status: safe.status, headers: { 'x-correlation-id': correlationId }, body: safe.body };
    }

    const token = authHeader.substring(7).trim();
    const authValidation = authService.authenticateToken(token);
    if (!authValidation.ok) {
      const safe = mapErrorToSafeHttpResponse(authValidation.error);
      responseStatus = safe.status;
      return { status: safe.status, headers: { 'x-correlation-id': correlationId }, body: safe.body };
    }

    const currentUserId = authValidation.session.userId;

    // Per-user rate limiting on writes
    if (req.method === 'POST' || req.method === 'DELETE') {
      const userRateCheck = rateLimiter.checkLimit(`user:${currentUserId}`, { maxRequests: 40, windowMs: 60000 });
      if (!userRateCheck.ok) {
        const safeResp = mapErrorToSafeHttpResponse(userRateCheck.error);
        responseStatus = safeResp.status;
        return { status: safeResp.status, headers: { 'x-correlation-id': correlationId }, body: safeResp.body };
      }
    }

    // 4. Quiz Session Handlers
    if (req.method === 'POST' && cleanPath === '/api/quiz/sessions') {
      normalizedRoute = 'POST /api/quiz/sessions';
      const result = await quizUseCase.startSession(req.body, currentUserId);
      if (!result.ok) {
        const safe = mapErrorToSafeHttpResponse(result.error);
        responseStatus = safe.status;
        return { status: safe.status, headers: { 'x-correlation-id': correlationId }, body: safe.body };
      }
      return { status: 201, headers: { 'x-correlation-id': correlationId }, body: result.data };
    }

    if (req.method === 'POST' && cleanPath === '/api/quiz/attempts') {
      normalizedRoute = 'POST /api/quiz/attempts';
      const result = await quizUseCase.submitAttempt(req.body, currentUserId);
      if (!result.ok) {
        const safe = mapErrorToSafeHttpResponse(result.error);
        responseStatus = safe.status;
        return { status: safe.status, headers: { 'x-correlation-id': correlationId }, body: safe.body };
      }
      return { status: 200, headers: { 'x-correlation-id': correlationId }, body: result.data };
    }

    const finalizeMatch = cleanPath.match(/^\/api\/quiz\/sessions\/([^/]+)\/finalize$/);
    if (req.method === 'POST' && finalizeMatch) {
      normalizedRoute = 'POST /api/quiz/sessions/:id/finalize';
      const sessionIdFromPath = finalizeMatch[1] ?? '';
      // Merge path param with body for strict validation
      const mergedPayload =
        typeof req.body === 'object' && req.body !== null
          ? { ...req.body, sessionId: sessionIdFromPath }
          : { sessionId: sessionIdFromPath };
      const result = await quizUseCase.finalizeSession(mergedPayload, currentUserId);
      if (!result.ok) {
        const safe = mapErrorToSafeHttpResponse(result.error);
        responseStatus = safe.status;
        return { status: safe.status, headers: { 'x-correlation-id': correlationId }, body: safe.body };
      }
      return { status: 200, headers: { 'x-correlation-id': correlationId }, body: result.data };
    }

    // 5. Readiness Score Handler
    if (req.method === 'GET' && cleanPath === '/api/readiness') {
      normalizedRoute = 'GET /api/readiness';
      const result = await readinessUseCase.getReadiness(req.query, currentUserId);
      if (!result.ok) {
        const safe = mapErrorToSafeHttpResponse(result.error);
        responseStatus = safe.status;
        return { status: safe.status, headers: { 'x-correlation-id': correlationId }, body: safe.body };
      }
      return { status: 200, headers: { 'x-correlation-id': correlationId }, body: result.data };
    }

    // 6. User Data Export Handler
    if (req.method === 'GET' && cleanPath === '/api/user/export') {
      normalizedRoute = 'GET /api/user/export';
      const result = await candidateDataUseCase.exportData(req.query, currentUserId);
      if (!result.ok) {
        const safe = mapErrorToSafeHttpResponse(result.error);
        responseStatus = safe.status;
        return { status: safe.status, headers: { 'x-correlation-id': correlationId }, body: safe.body };
      }
      return { status: 200, headers: { 'x-correlation-id': correlationId }, body: result.data };
    }

    // 7. Delete Account Handler
    if (req.method === 'DELETE' && cleanPath === '/api/user/account') {
      normalizedRoute = 'DELETE /api/user/account';
      const result = await candidateDataUseCase.deleteAccount(req.body, currentUserId);
      if (!result.ok) {
        const safe = mapErrorToSafeHttpResponse(result.error);
        responseStatus = safe.status;
        return { status: safe.status, headers: { 'x-correlation-id': correlationId }, body: safe.body };
      }
      if (token) {
        authService.logout(token);
      }
      return { status: 200, headers: { 'x-correlation-id': correlationId }, body: result.data };
    }

    // Unmatched Route
    const notFound = mapErrorToSafeHttpResponse({
      kind: 'NotFoundError',
      statusCode: 404,
      message: `Endpoint ${req.method} ${cleanPath} not found.`,
      resource: cleanPath,
    });
    responseStatus = notFound.status;
    return { status: notFound.status, headers: { 'x-correlation-id': correlationId }, body: notFound.body };
  } catch (err) {
    const safe = mapErrorToSafeHttpResponse(err);
    responseStatus = safe.status;
    logger.error('Unhandled request exception intercepted', correlationId, {
      route: normalizedRoute,
      status: safe.status,
    });
    return { status: safe.status, headers: { 'x-correlation-id': correlationId }, body: safe.body };
  } finally {
    const elapsedMs = performance.now() - startTime;
    metrics.observeDuration(normalizedRoute, elapsedMs);
    metrics.incrementRequests(normalizedRoute, responseStatus);
    logger.info(`Completed ${req.method} ${normalizedRoute} with status ${responseStatus}`, correlationId, {
      durationMs: Number(elapsedMs.toFixed(2)),
      statusCode: responseStatus,
    });
  }
}
