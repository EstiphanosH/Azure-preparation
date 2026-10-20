# R7 Gate: Security Headers & Per-Environment CSP Enforcement

## Compliance Notice
This application is independent and educational. It contains zero vendor trademarks or proprietary question dumps.

---

## 1. Per-Environment Security Headers Matrix

| Header Name | Development Baseline | Staging Baseline | Production Hardened Baseline | Verification Status |
| :--- | :--- | :--- | :--- | :--- |
| **`Content-Security-Policy`** | Permissive for local dev / HMR | Strict, no eval, no inline script | `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self' https:; img-src 'self' data: https:; font-src 'self' data:; object-src 'none'; base-uri 'self'; frame-ancestors 'none';` | **PASS (0 'unsafe-eval', 0 script inline)** |
| **`X-Content-Type-Options`** | `nosniff` | `nosniff` | `nosniff` | **PASS** |
| **`X-Frame-Options`** | `SAMEORIGIN` | `DENY` | `DENY` | **PASS (Anti-Clickjacking)** |
| **`Strict-Transport-Security`** | `max-age=0` | `max-age=31536000; includeSubDomains` | `max-age=63072000; includeSubDomains; preload` | **PASS (2-Year HSTS + Preload)** |
| **`Referrer-Policy`** | `no-referrer-when-downgrade` | `strict-origin-when-cross-origin` | `strict-origin-when-cross-origin` | **PASS** |
| **`Permissions-Policy`** | `camera=(), microphone=(), geolocation=()` | `camera=(), microphone=(), geolocation=()` | `camera=(), microphone=(), geolocation=()` | **PASS (Hardware API Locked)** |

---

## 2. Automated Test Execution Evidence

From `tests/security/csp.test.ts`:
```text
✓ tests/security/csp.test.ts (4 tests)
  ✓ Content Security Policy & HTTP Header Governance (4)
    ✓ strictly forbids "unsafe-eval" in production Content-Security-Policy (1 ms)
    ✓ strictly forbids script-src "unsafe-inline" in production Content-Security-Policy (0 ms)
    ✓ enforces frame-ancestors none and X-Frame-Options DENY against clickjacking in production (0 ms)
    ✓ enforces HSTS with minimum 2-year max-age and preload in production (0 ms)
```
