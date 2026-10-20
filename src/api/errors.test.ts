import { describe, it, expect } from 'vitest';
import { mapErrorToSafeHttpResponse, ApiError } from './errors.ts';

describe('Error Handling & Safe HTTP Response Mapper', () => {
  it('forces a raw PostgreSQL syntax error and verifies zero SQL or stack leaks', () => {
    // Simulated raw database error from Postgres driver with syntax and table name
    const rawPostgresError = new Error(
      'syntax error at or near "SELEKT" at character 1, table="public.quiz_sessions", line 42, in query: SELEKT * FROM public.quiz_sessions WHERE user_id = $1;'
    );
    rawPostgresError.stack =
      'Error: syntax error at or near "SELEKT"\n    at PostgresSocket.parse (/node_modules/pg/lib/connection.js:140:12)\n    at Query.handleError (/node_modules/pg/lib/query.js:89:15)';

    const safeResponse = mapErrorToSafeHttpResponse(rawPostgresError);

    // 1. Status must be 500
    expect(safeResponse.status).toBe(500);

    // 2. Message must be sanitized
    expect(safeResponse.body.error.message).toBe('An internal error occurred. Please try again.');
    expect(safeResponse.body.error.code).toBe('INTERNAL_SERVER_ERROR');

    // 3. Must generate incidentId for tracking
    expect(safeResponse.body.error.incidentId).toBeDefined();
    expect(safeResponse.body.error.incidentId).toMatch(/^inc-/);

    // 4. Assert zero SQL or stack leaks in serialized JSON
    const serialized = JSON.stringify(safeResponse);
    expect(serialized).not.toContain('SELEKT');
    expect(serialized).not.toContain('quiz_sessions');
    expect(serialized).not.toContain('syntax error');
    expect(serialized).not.toContain('node_modules');
    expect(serialized).not.toContain('PostgresSocket');
  });

  it('maps typed ValidationError properly with issue details', () => {
    const valError: ApiError = {
      kind: 'ValidationError',
      statusCode: 400,
      message: 'Invalid request input parameters',
      issues: ['email must be a valid email', 'password too short'],
    };

    const res = mapErrorToSafeHttpResponse(valError);
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_FAILED');
    expect(res.body.error.details).toEqual(['email must be a valid email', 'password too short']);
  });

  it('maps RLS violation into safe 403 ACCESS_DENIED', () => {
    const rlsError = new Error('new row violates row-level security policy for table "quiz_sessions"');
    const res = mapErrorToSafeHttpResponse(rlsError);

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('ACCESS_DENIED');
    expect(res.body.error.message).toBe('Access to the requested resource is denied by security policy.');
    expect(JSON.stringify(res)).not.toContain('quiz_sessions');
  });

  it('maps unique constraint error into safe 409 RESOURCE_CONFLICT', () => {
    const duplicateKeyError = new Error('duplicate key value violates unique constraint "profiles_username_key"');
    const res = mapErrorToSafeHttpResponse(duplicateKeyError);

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('RESOURCE_CONFLICT');
    expect(res.body.error.message).toBe('The requested resource already exists.');
    expect(JSON.stringify(res)).not.toContain('profiles_username_key');
  });
});
