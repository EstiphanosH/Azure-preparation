import { describe, it, expect } from 'vitest';
import { RateLimiter } from './rateLimit.ts';

describe('RateLimiter Boundary Enforcement', () => {
  it('permits requests within quota and strictly triggers 429 when threshold exceeded', () => {
    const limiter = new RateLimiter();
    const clientKey = 'ip-198.51.100.42:auth-endpoint';
    const config = { maxRequests: 3, windowMs: 10000 };

    // Request 1: Allowed
    expect(limiter.checkLimit(clientKey, config).ok).toBe(true);

    // Request 2: Allowed
    expect(limiter.checkLimit(clientKey, config).ok).toBe(true);

    // Request 3: Allowed
    expect(limiter.checkLimit(clientKey, config).ok).toBe(true);

    // Request 4: Exceeds threshold -> Must return 429 RateLimitError
    const res4 = limiter.checkLimit(clientKey, config);
    expect(res4.ok).toBe(false);
    if (!res4.ok) {
      expect(res4.error.kind).toBe('RateLimitError');
      if (res4.error.kind === 'RateLimitError') {
        expect(res4.error.statusCode).toBe(429);
        expect(res4.error.retryAfterSeconds).toBeGreaterThan(0);
        expect(res4.error.message).toContain('Too many requests');
      }
    }

  });
});
