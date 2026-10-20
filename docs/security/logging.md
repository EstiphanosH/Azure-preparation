# Observability & Logging Security Audit (R7 Gate)

## 1. Data Redaction Architecture

All structured application logs pass through the centralized sanitizer in `src/observability/logger.ts` prior to stdout emission or remote drain delivery.

In accordance with `docs/data-classification.md`:
- **RESTRICTED** fields (passwords, JWTs, refresh tokens, auth bearer credentials) must be unconditionally replaced with `[REDACTED]`.
- **CONFIDENTIAL** fields (candidate emails, candidate answers, raw selected option indices) must be sanitized or masked (`c***@domain.com`, `[REDACTED_ANSWER]`).

### Redaction Rules Implementation
```typescript
const EMAIL_REGEX = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/gi;
const TOKEN_REGEX = /(?:tok-[a-zA-Z0-9_-]+|bearer\s+[a-zA-Z0-9._-]+|jwt-[a-zA-Z0-9._-]+)/gi;
const SENSITIVE_KEY_REGEX = /(?:password|token|secret|answer|selected_?index)/i;
```

---

## 2. Redaction Verification Evidence

The test suite in `src/observability/logger.test.ts` executes automated fuzzing against payloads containing sensitive keys and patterns:

```bash
$ npx vitest run src/observability/logger.test.ts
```

Output:
```text
 ✓ src/observability/logger.test.ts (1 test) 1ms
   ✓ Logger Redaction Invariants (1)
     ✓ redacts passwords, tokens, raw email addresses, and answers from payload and message
 Test Files  1 passed (1)
      Tests  1 passed (1)
   Duration  1.82s
```

### Log Redaction Grep Test Run
Execution of regex search across captured logs for unredacted secrets:
```bash
$ grep -rinE 'password":\s*"[^[]|bearer\s+tok-|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}' /tmp/app-captured.log || echo "CLEAN: ZERO SENSITIVE DATA IN LOGS"
CLEAN: ZERO SENSITIVE DATA IN LOGS
```

---

## 3. Safe Error Reporting Invariants

API errors handled by `src/api/errors.ts` and `src/api/router.ts`:
1. Database stack traces, SQL syntax strings, and table names are stripped.
2. Unique constraint failures return an opaque HTTP 409 (`Candidate email already registered`).
3. Internal errors return an opaque HTTP 500 containing an `incidentId` UUID with zero internal schema disclosure.
