# OWASP Top 10 (2021) Defensive Audit & PoC Verification

## Compliance Notice
This diagnostic software is independent and educational. It contains zero vendor trademarks or proprietary question dumps.

---

## OWASP Evaluation Matrix

| Category | Vulnerability Category | Assessed Risk | Implementation Status | Automated Proof & PoC |
| :--- | :--- | :--- | :--- | :--- |
| **A01:2021** | Broken Access Control | **CRITICAL** | **RESOLVED** | RLS multi-user isolation test (`tests/security/rls-bypass.spec.ts`) proves User B cannot access User A rows. |
| **A02:2021** | Cryptographic Failures | **HIGH** | **RESOLVED** | Transport TLS 1.3 only; Server enforces 5-rule enterprise password policy; sensitive tokens stored in encrypted vaults. |
| **A03:2021** | Injection | **HIGH** | **RESOLVED** | Pure parameterized queries; Zod `.strict()` schema casting; Prompt injection disabled (`docs/security/prompt-injection.md`). |
| **A04:2021** | Insecure Design | **MEDIUM** | **RESOLVED** | Frozen functional domain core; client-side score computation prohibited; state machine transition validation. |
| **A05:2021** | Security Misconfiguration | **HIGH** | **RESOLVED** | Production CSP forbids `'unsafe-eval'` and `script-src 'unsafe-inline'`; stack traces redacted from HTTP responses. |
| **A06:2021** | Vulnerable & Outdated Components | **MEDIUM** | **RESOLVED** | Strict dependency pinning (0 range operators in `package.json`); `npm audit` zero high/critical vulnerabilities. |
| **A07:2021** | Identification & Authentication Failures | **HIGH** | **RESOLVED** | Server-side logout with immediate blacklist revocation; single-flight mutex on silent token refresh. |
| **A08:2021** | Software & Data Integrity Failures | **MEDIUM** | **RESOLVED** | CycloneDX SBOM generated; deterministic CI build; Zod runtime input/output integrity validation. |
| **A09:2021** | Security Logging & Monitoring Failures | **LOW** | **RESOLVED** | Structured JSON logging with automated redaction regex for emails, tokens, and candidate answers. |
| **A10:2021** | Server-Side Request Forgery (SSRF) | **LOW** | **RESOLVED** | Zero outbound URL proxying or arbitrary remote fetching endpoints exist in backend service tier. |

---

## Detailed PoC Analyses & Defenses

### A01: Broken Access Control (IDOR & Multi-Tenant Snooping)
- **Attack Scenario**: Attacker authenticates as User B, intercepts their session token, and issues `POST /api/quiz/attempts` or `GET /api/user/export` targeting User A's `userId` or `sessionId`.
- **Proof of Defense**:
  ```typescript
  // Attempt to submit answer on unowned session
  const hostileAttempt = await dispatchApiRequest({
    method: 'POST',
    path: '/api/quiz/attempts',
    headers: { authorization: `Bearer ${userBToken}` },
    body: { sessionId: userASessionId, questionId: 'Q-01', selectedIndex: 0, timeTakenMs: 1000 },
  });
  // Result: 401 Unauthorized ("Unauthorized attempt access across candidates")
  ```

### A02: Cryptographic Failures & Password Policy
- **Attack Scenario**: Attacker attempts registration with weak credentials (e.g., `password123`).
- **Proof of Defense**:
  Server rejects payload before database execution with `400 ValidationFailed`, returning specific policy failure details:
  ```json
  {
    "error": {
      "code": "VALIDATION_FAILED",
      "details": [
        "Password must contain at least one uppercase letter",
        "Password must contain at least one special symbol"
      ]
    }
  }
  ```

### A05: Security Misconfiguration (Production CSP)
- **Defensive Invariant**: Production CSP prohibits inline execution and eval scripts:
  `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; object-src 'none'; frame-ancestors 'none';`

### A07: Identification Failures (Token Replay After Logout)
- **Proof of Defense**: Calling `POST /api/auth/logout` places the token into `AuthService.revokedTokens`. Replaying the token returns `401 Unauthorized` with code `SESSION_REVOKED`.
