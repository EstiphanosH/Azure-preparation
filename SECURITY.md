# Security Policy & Vulnerability Disclosure

## 1. Compliance & Independent Status
This application is an independent, unofficial readiness diagnostic simulator. It is not affiliated with, endorsed by, or sponsored by Microsoft Corporation or any cloud vendor.

---

## 2. Supported Versions

| Version | Supported | Status |
| :--- | :--- | :--- |
| `1.0.x` | Yes | Active Security Maintenance |
| `< 1.0` | No | Deprecated |

---

## 3. Reporting a Vulnerability

We take the security of candidate data and assessment integrity seriously. If you discover a vulnerability:
1. Do NOT file a public issue or discuss in community forums.
2. Email your report to the designated security contact: `security@cloudfix.edu` or open an encrypted advisory.
3. Include detailed steps to reproduce, proof-of-concept scripts or HTTP requests, and the estimated impact.
4. We aim to acknowledge receipt within 24 hours and provide an initial assessment or remediation timeline within 72 hours.

---

## 4. Scope & Primary Trust Boundaries

### In Scope
- Application programming interfaces under `/api/*`
- Candidate authentication, session tokens, and refresh flows
- Row-Level Security (RLS) enforcement on Supabase PostgreSQL tables
- GDPR candidate data export (`/api/user/export`) and hard deletion (`/api/user/account`)
- Cross-Site Scripting (XSS), Content Security Policy (CSP), and Injection defenses

### Out of Scope
- Denial of Service attacks requiring volumetric traffic beyond configured rate limits
- Vulnerabilities dependent on root/compromised end-user devices or malicious browser extensions
- Social engineering attacks targeting staff or candidates

---

## 5. Security Controls & Defensive Invariants

1. **Strict Input/Output Validation**:
   Every boundary and endpoint uses Zod `.strict()` to reject unannounced fields.
2. **Deterministic Domain Scoring**:
   Client-side scores are never trusted; assessment outcomes are calculated by the frozen server domain engine.
3. **Database Isolation via RLS**:
   PostgreSQL `FORCE ROW LEVEL SECURITY` isolates candidate attempts, sessions, and credentials.
4. **Content Security Policy**:
   Strict production CSP prohibiting `'unsafe-eval'` and unauthorized script sources.
5. **Zero Vendor Trademark Infringement**:
   Automated regression guards prevent proprietary logo or exam dump inclusion.

---

## 6. Known Limitations & Architectural Decisions
- Generative AI hints are disabled by default (`ff_generative_ai_hints: false`) to prevent prompt-injection attacks.
- High write burst operations are subject to rate limiting (50 req/min/IP).
