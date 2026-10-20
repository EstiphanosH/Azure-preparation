export type ApiError =
  | {
      readonly kind: 'AuthError';
      readonly statusCode: 401;
      readonly message: string;
      readonly code: 'UNAUTHORIZED' | 'TOKEN_EXPIRED' | 'SESSION_REVOKED';
    }
  | {
      readonly kind: 'ValidationError';
      readonly statusCode: 400;
      readonly message: string;
      readonly issues: readonly string[];
    }
  | {
      readonly kind: 'NotFoundError';
      readonly statusCode: 404;
      readonly message: string;
      readonly resource: string;
    }
  | {
      readonly kind: 'ConflictError';
      readonly statusCode: 409;
      readonly message: string;
      readonly conflictKey: string;
    }
  | {
      readonly kind: 'RateLimitError';
      readonly statusCode: 429;
      readonly message: string;
      readonly retryAfterSeconds: number;
    }
  | {
      readonly kind: 'InternalError';
      readonly statusCode: 500;
      readonly message: 'An internal error occurred. Please try again.';
      readonly incidentId: string;
    };

export interface SafeHttpResponse {
  readonly status: number;
  readonly body: {
    readonly success: false;
    readonly error: {
      readonly code: string;
      readonly message: string;
      readonly details?: unknown;
      readonly incidentId?: string;
    };
  };
}

/**
 * Pure error mapper transforming any domain, database, or network error
 * into a safe, sanitized HTTP response.
 * Completely redacts raw SQL strings, table names, syntax errors, and stack traces.
 */
export function mapErrorToSafeHttpResponse(err: unknown): SafeHttpResponse {
  // Check if it's already a recognized typed ApiError
  if (typeof err === 'object' && err !== null && 'kind' in err) {
    const apiErr = err as ApiError;
    switch (apiErr.kind) {
      case 'AuthError':
        return {
          status: apiErr.statusCode,
          body: {
            success: false,
            error: {
              code: apiErr.code,
              message: apiErr.message,
            },
          },
        };
      case 'ValidationError':
        return {
          status: apiErr.statusCode,
          body: {
            success: false,
            error: {
              code: 'VALIDATION_FAILED',
              message: apiErr.message,
              details: apiErr.issues,
            },
          },
        };
      case 'NotFoundError':
        return {
          status: apiErr.statusCode,
          body: {
            success: false,
            error: {
              code: 'RESOURCE_NOT_FOUND',
              message: `${apiErr.resource} not found.`,
            },
          },
        };
      case 'ConflictError':
        return {
          status: apiErr.statusCode,
          body: {
            success: false,
            error: {
              code: 'RESOURCE_CONFLICT',
              message: `Conflict detected on ${apiErr.conflictKey}.`,
            },
          },
        };
      case 'RateLimitError':
        return {
          status: apiErr.statusCode,
          body: {
            success: false,
            error: {
              code: 'TOO_MANY_REQUESTS',
              message: apiErr.message,
              details: { retryAfterSeconds: apiErr.retryAfterSeconds },
            },
          },
        };
      case 'InternalError':
        return {
          status: apiErr.statusCode,
          body: {
            success: false,
            error: {
              code: 'INTERNAL_SERVER_ERROR',
              message: apiErr.message,
              incidentId: apiErr.incidentId,
            },
          },
        };
    }
  }

  // Raw database error (e.g. Postgres syntax error, connection timeout, foreign key violation)
  const incidentId = `inc-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
  const rawMsg = err instanceof Error ? err.message : String(err);

  // Check for unique constraint violation
  if (rawMsg.includes('unique constraint') || rawMsg.includes('duplicate key')) {
    return {
      status: 409,
      body: {
        success: false,
        error: {
          code: 'RESOURCE_CONFLICT',
          message: 'The requested resource already exists.',
        },
      },
    };
  }

  // Check for RLS policy violation
  if (rawMsg.includes('violates row-level security policy') || rawMsg.includes('permission denied')) {
    return {
      status: 403,
      body: {
        success: false,
        error: {
          code: 'ACCESS_DENIED',
          message: 'Access to the requested resource is denied by security policy.',
        },
      },
    };
  }

  // Default fallback: Redact everything, return generic message + incident ID
  return {
    status: 500,
    body: {
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An internal error occurred. Please try again.',
        incidentId,
      },
    },
  };
}
