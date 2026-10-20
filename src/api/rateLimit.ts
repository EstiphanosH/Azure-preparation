import { ApiError } from './errors.ts';

export interface RateLimitConfig {
  readonly maxRequests: number;
  readonly windowMs: number;
}

export class RateLimiter {
  private requestBuckets = new Map<string, number[]>();

  public checkLimit(
    key: string,
    config: RateLimitConfig = { maxRequests: 5, windowMs: 60000 }
  ): { ok: true } | { ok: false; error: ApiError } {
    const now = Date.now();
    const timestamps = this.requestBuckets.get(key) || [];

    // Filter out timestamps older than the sliding window
    const validTimestamps = timestamps.filter((t) => now - t < config.windowMs);

    if (validTimestamps.length >= config.maxRequests) {
      const oldestValid = validTimestamps[0] ?? now;
      const retryAfterSeconds = Math.max(1, Math.ceil((oldestValid + config.windowMs - now) / 1000));

      return {
        ok: false,
        error: {
          kind: 'RateLimitError',
          statusCode: 429,
          message: `Too many requests. Limit is ${config.maxRequests} requests per ${config.windowMs / 1000}s.`,
          retryAfterSeconds,
        },
      };
    }

    validTimestamps.push(now);
    this.requestBuckets.set(key, validTimestamps);
    return { ok: true };
  }

  public reset(key?: string): void {
    if (key) {
      this.requestBuckets.delete(key);
    } else {
      this.requestBuckets.clear();
    }
  }
}

export const rateLimiter = new RateLimiter();
