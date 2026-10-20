import { describe, it, expect } from 'vitest';

export interface SecurityHeadersConfig {
  readonly 'Content-Security-Policy': string;
  readonly 'X-Content-Type-Options': string;
  readonly 'X-Frame-Options': string;
  readonly 'Strict-Transport-Security': string;
  readonly 'Referrer-Policy': string;
  readonly 'Permissions-Policy': string;
}

export const ENV_SECURITY_HEADERS: Record<'development' | 'staging' | 'production', SecurityHeadersConfig> = {
  development: {
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; connect-src 'self' ws: http:; img-src 'self' data: https:;",
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'SAMEORIGIN',
    'Strict-Transport-Security': 'max-age=0',
    'Referrer-Policy': 'no-referrer-when-downgrade',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  },
  staging: {
    'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self' https:; img-src 'self' data: https:; frame-ancestors 'none';",
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  },
  production: {
    'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self' https:; img-src 'self' data: https:; font-src 'self' data:; object-src 'none'; base-uri 'self'; frame-ancestors 'none';",
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  },
};

describe('Content Security Policy & HTTP Header Governance', () => {
  it('strictly forbids "unsafe-eval" in production Content-Security-Policy', () => {
    const prodCsp = ENV_SECURITY_HEADERS.production['Content-Security-Policy'];
    expect(prodCsp).not.toContain("'unsafe-eval'");
  });

  it('strictly forbids script-src "unsafe-inline" in production Content-Security-Policy', () => {
    const prodCsp = ENV_SECURITY_HEADERS.production['Content-Security-Policy'];
    // Must not contain script-src 'unsafe-inline'
    const scriptSrcMatch = prodCsp.match(/script-src\s+([^;]+)/);
    expect(scriptSrcMatch).toBeTruthy();
    const scriptDirectives = scriptSrcMatch?.[1] ?? '';
    expect(scriptDirectives).not.toContain("'unsafe-inline'");
  });

  it('enforces frame-ancestors none and X-Frame-Options DENY against clickjacking in production', () => {
    const headers = ENV_SECURITY_HEADERS.production;
    expect(headers['X-Frame-Options']).toBe('DENY');
    expect(headers['Content-Security-Policy']).toContain("frame-ancestors 'none'");
  });

  it('enforces HSTS with minimum 2-year max-age and preload in production', () => {
    const hsts = ENV_SECURITY_HEADERS.production['Strict-Transport-Security'];
    expect(hsts).toContain('max-age=63072000');
    expect(hsts).toContain('includeSubDomains');
    expect(hsts).toContain('preload');
  });
});
