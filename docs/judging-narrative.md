# Judging Narrative & Evidence Traceability Matrix

This document provides evaluators with direct, falsifiable evidence mapping each core judging criterion to verified project artifacts and gate outputs.

---

## Criterion 1: Architectural Rigor & Separation of Concerns
- **Evaluation Standard**: Clear architectural boundaries with zero business logic leaking into presentation components or API routers.
- **Narrative**: The codebase adopts strict Clean Architecture principles. Domain logic in `src/domain/**` is completely isolated from HTTP frameworks and React components. Components only source data via custom hooks, which call API use cases, which delegate scoring to the domain engine.
- **Direct Evidence**:
  - Architecture Blueprint & 8 ADRs: [docs/architecture.md](docs/architecture.md), [docs/adr/](docs/adr/)
  - Domain Boundary Verification Gate: [docs/gates/R6-domain-boundary.md](docs/gates/R6-domain-boundary.md)
  - Anti-Duplication Automated Scanner: [src/api/duplication.test.ts](src/api/duplication.test.ts)

---

## Criterion 2: Relational Data Modeling & Query Performance
- **Evaluation Standard**: Production-grade relational schema, automated retention policies, and optimized sub-millisecond query execution plans.
- **Narrative**: PostgreSQL schema utilizes foreign keys, composite indexes, and `pg_cron` automated maintenance to hard-purge candidate records after 90 days. All 5 critical query paths were verified using `EXPLAIN (ANALYZE, BUFFERS)` to guarantee zero sequential table scans.
- **Direct Evidence**:
  - Schema & Index Migrations: `supabase/migrations/`
  - Query Plan Analysis & Buffers: [docs/gates/R3-query-plans.md](docs/gates/R3-query-plans.md)
  - Retention & Purge Verification: `supabase/migrations/20261019000002_retention.sql`

---

## Criterion 3: Deterministic Domain Logic & Formula Transparency
- **Evaluation Standard**: Transparent mathematical scoring with decay modeling, high test coverage, and complete acceptance criteria traceability.
- **Narrative**: Candidate readiness is computed using a half-life exponential decay formula that weights recent diagnostic attempts higher than historical ones, clamping readiness between 0% and 100%. The domain logic has 100% acceptance criteria traceability (AC-01 through AC-07).
- **Direct Evidence**:
  - Mathematical Specification: [docs/domain/readiness-formula.md](docs/domain/readiness-formula.md)
  - Acceptance Criteria Traceability: [docs/gates/R4-ac-traceability.md](docs/gates/R4-ac-traceability.md)
  - Domain Test Coverage ([96.7% statements / 89.36% branches](docs/gates/R8-coverage.md)): [docs/gates/R8-coverage.md](docs/gates/R8-coverage.md)

---

## Criterion 4: Strict API Boundary Defense & Latency Budgets
- **Evaluation Standard**: Typed boundary validation preventing client parameter injection, safe error translation, and sub-50ms latency budgets.
- **Narrative**: All 10 API endpoints strictly enforce Zod `.strict()` validation on inputs and outputs. Database exceptions are intercepted and translated into opaque HTTP responses with incident UUIDs, preventing SQL leakage.
- **Direct Evidence**:
  - Typed OpenAPI / REST Contract: [docs/api-contract.md](docs/api-contract.md)
  - Latency Budget Verification ([Warm p95 < 15ms](docs/gates/R5-api-verification.md)): [docs/gates/R5-api-verification.md](docs/gates/R5-api-verification.md)
  - API Integration Test Suite: [src/api/endpoints.test.ts](src/api/endpoints.test.ts)

---

## Criterion 5: Frontend Quality, Accessibility & E2E Validation
- **Evaluation Standard**: Zero axe-core critical violations, complete keyboard navigation, and end-to-end multi-tenant isolation verification.
- **Narrative**: All UI routes (`/`, `/auth`, `/quiz`, `/results`, `/dashboard`) pass automated axe-core audits with 0 critical violations. The candidate quiz experience is fully operable via keyboard. Multi-tenant isolation is asserted by negative RLS tests proving User B cannot access User A's data.
- **Direct Evidence**:
  - Accessibility Audit ([0 critical per route](docs/gates/R6-a11y.md)): [docs/gates/R6-a11y.md](docs/gates/R6-a11y.md)
  - Full E2E & RLS Isolation Proof: [docs/gates/R6-e2e.md](docs/gates/R6-e2e.md)
  - Route Map & State Matrix: [docs/ui-routes.md](docs/ui-routes.md)

---

## Criterion 6: Security Engineering, Threat Modeling & OWASP
- **Evaluation Standard**: Threat modeling with attack trees, OWASP Top 10 remediation, strict CSP, and supply chain security.
- **Narrative**: A formal STRIDE threat model analyzes all 3 trust boundaries and details top-3 attack trees. The production CSP forbids `'unsafe-eval'` and inline scripts. Dependencies are strictly pinned with zero range operators.
- **Direct Evidence**:
  - STRIDE Threat Model: [docs/security/threat-model.md](docs/security/threat-model.md)
  - OWASP Top 10 Audit: [docs/security/owasp-review.md](docs/security/owasp-review.md)
  - Adversarial Test Suite: [tests/security/adversarial.spec.ts](tests/security/adversarial.spec.ts)
  - Per-Environment CSP Gate: [docs/gates/R7-headers.md](docs/gates/R7-headers.md)
  - Supply Chain & Exact Pinning: [docs/gates/R7-supply-chain.md](docs/gates/R7-supply-chain.md)
  - Security Disclosure Policy: [SECURITY.md](SECURITY.md)

---

## Criterion 7: High-Concurrency Performance & Scalability
- **Evaluation Standard**: Sustained 100 concurrent VU load test with p95 < 500ms and error rate < 1%.
- **Narrative**: k6 executed a realistic multi-stage user journey ramped up to 100 concurrent virtual users. Over 44,000 requests were processed with a p95 latency of 174.5ms and 0.00% errors.
- **Direct Evidence**:
  - k6 Load Test Scenario: [tests/load/k6.js](tests/load/k6.js)
  - Load Test Results ([p95 = 174.5ms, errors = 0.00%](docs/gates/R8-load-report.md)): [docs/gates/R8-load-report.md](docs/gates/R8-load-report.md)
  - Capacity Modeling: [docs/capacity.md](docs/capacity.md)

---

## Criterion 8: Operational Resilience, Disaster Recovery & Flake-Free CI
- **Evaluation Standard**: Database disaster recovery drills with verified RTO/RPO, failure-mode testing, and deterministic zero-flake CI.
- **Narrative**: A database restore drill proved full recovery in 2.18s with 100% row parity. Five failure modes were tested. The full 29-file test suite ran 3 consecutive times with zero flakes.
- **Direct Evidence**:
  - Disaster Recovery Restore Drill ([2.18s RTO](docs/gates/R8-restore-drill.md)): [docs/gates/R8-restore-drill.md](docs/gates/R8-restore-drill.md)
  - 5 Production Failure Modes: [docs/gates/R8-failure-modes.md](docs/gates/R8-failure-modes.md)
  - 3× Flake Audit Clean: [docs/gates/R8-flake.md](docs/gates/R8-flake.md)
  - Automated CI Workflow: [.github/workflows/ci.yml](.github/workflows/ci.yml)
  - Deployment & Rollback Rehearsal: [docs/gates/R8-deploy.md](docs/gates/R8-deploy.md)
