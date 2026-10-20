# CloudFix Architect Readiness Simulator

> ### ⚠️ Mandatory Legal & Trademark Disclaimer
> **Unofficial — not affiliated with Microsoft Corporation.**  
> This software is an independent educational diagnostic simulator and architecture evaluation tool. It is not endorsed, certified, or sponsored by Microsoft Corporation or any cloud vendor. All scenario questions are original pedagogical formulations; zero vendor logos, zero copyrighted exam dumps, and zero proprietary trademarks are contained herein.

---

## 📌 Release Status
- **Current Version**: `v1.0.0` (General Availability)
- **Sign-Off Decision**: 🟢 **SHIP**
- **Formal Sign-Off Document**: [docs/gates/R10-signoff.md](docs/gates/R10-signoff.md)
- **Residual Risks Register**: [docs/gates/R10-residual-risks.md](docs/gates/R10-residual-risks.md)
- **Quality Gates Verification**: [docs/gates/R10-gate-verification.md](docs/gates/R10-gate-verification.md)

---

## 1. What It Is

**CloudFix Architect Readiness Simulator** is a production-grade assessment platform designed to measure cloud architecture competency with mathematical precision. Rather than testing passive rote memorization with static quizzes, CloudFix evaluates candidates through applied scenario analysis across 5 core architectural domains:

1. **Cloud Architecture & Resilience (DOM-CONCEPTS)**
2. **Reliable Storage & Lifecycle (DOM-STORAGE)**
3. **Identity & Zero-Trust Governance (DOM-IDENTITY)**
4. **Virtual Networking & Traffic Routing (DOM-NETWORK)**
5. **Hybrid Observability & High Availability (DOM-OPS)**

Candidate answers feed into a pure deterministic domain engine applying half-life exponential decay modeling. The platform outputs an overall readiness rating (e.g., *'READY'*, *'NEAR READY'*, *'STUDY NEEDED'*) along with domain-specific diagnostic radar charts.

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        CANDIDATE DASHBOARD                             │
│ ┌──────────────────────┐   ┌─────────────────────────────────────────┐ │
│ │   READINESS GAUGE    │   │         DOMAIN SCORE RADAR              │ │
│ │        84%           │   │ Architecture: 92% █████████             │ │
│ │      [READY]         │   │ Storage:      85% ████████              │ │
│ │                      │   │ Identity:     80% ████████              │ │
│ │ Decay Half-life: 14d │   │ Networking:   75% ███████               │ │
│ │ Trend: +6.4%         │   │ Monitoring:   88% ████████              │ │
│ └──────────────────────┘   └─────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Quickstart Guide (Clean Clone in $\le 5$ Minutes)

Follow these steps to clone, configure, test, and launch the application locally.

### Step 1: Clone Repository
```bash
git clone https://github.com/cloudfix/readiness-simulator.git
cd readiness-simulator
```

### Step 2: Configure Environment
```bash
cp .env.example .env
```
*(No cloud API keys or external secrets required for local development; in-memory mock repositories and synthetic catalog seeds run out-of-the-box).*

### Step 3: Clean Install Dependencies
All dependencies are strictly pinned to exact semver versions.
```bash
npm ci
```

### Step 4: Verify Local Type Safety & Tests
```bash
npx tsc --noEmit
npx vitest run
```
*Expected: 29 passed test files, 109 passed tests.* Proof: [docs/gates/R8-flake.md](docs/gates/R8-flake.md)

### Step 5: Start Local Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.  
Full clean-clone terminal execution log: [docs/gates/R9-clean-clone.md](docs/gates/R9-clean-clone.md).

### Step 6: Supabase Database Setup (Optional for Local PostgreSQL)
To connect to an external Supabase instance rather than in-memory storage:
```bash
supabase start
supabase db reset
supabase migration up
```
*(Runs migrations from `supabase/migrations/` including RLS policies, compound indexes, and 90-day retention jobs).*

---

## 3. Architecture Summary & ADR Blueprint

The system is structured according to Clean Architecture invariants:

```text
[ Browser / UI (React 19 + Tailwind) ]
               │
               ▼ (Custom Hooks: useQuiz, useAuth, useReadiness)
[ Application Tier: API Gateway & UseCases (Zod .strict()) ]
               │
               ▼ (Pure Domain Delegation)
[ Domain Engine: scoreSession & computeReadiness (Pure TS, Zero Side-Effects) ]
               │
               ▼ (Data Access Adapters)
[ Persistence Tier: PostgreSQL (Supabase / In-Memory Repo) ]
```

### Architecture Decision Records (ADRs)
- [ADR-001: Frontend Architecture & Server State with TanStack Query](docs/adr/ADR-001-frontend-and-state.md)
- [ADR-002: Backend Platform & Stateless Express/Node API Gateway](docs/adr/ADR-002-backend-platform.md)
- [ADR-003: Authentication, Session Lifecycle & Row-Level Security](docs/adr/ADR-003-auth-and-rls.md)
- [ADR-004: Relational Data Model Shape & Indexing Strategy](docs/adr/ADR-004-data-model-shape.md)
- [ADR-005: Feature Flag Governance & Safe Default-Off Invariants](docs/adr/ADR-005-feature-flags.md)
- [ADR-006: Testing Strategy & Strict Pre-Merge CI Quality Gates](docs/adr/ADR-006-testing-and-ci-gates.md)
- [ADR-007: Structured Logging & PII Redaction Filter](docs/adr/ADR-007-observability-vendor.md)
- [ADR-008: Database Connection Pooling & PgBouncer Sizing](docs/adr/ADR-008-connection-pooling.md)

Full architecture specification: [docs/architecture.md](docs/architecture.md).

---

## 4. Security Posture & Vulnerability Controls

- **Threat Modeling**: Formal STRIDE threat model with 3 top-level attack trees covering IDOR, score tampering, and token replay: [docs/security/threat-model.md](docs/security/threat-model.md).
- **OWASP Top 10 Review**: Zero unresolved Critical or High findings: [docs/security/owasp-review.md](docs/security/owasp-review.md).
- **Adversarial Test Suite**: Automated tests verifying multi-tenant isolation, JWT tamper rejection, rate limiting, and server-side password policies: [tests/security/adversarial.spec.ts](tests/security/adversarial.spec.ts).
- **Content Security Policy**: Production CSP forbids `'unsafe-eval'` and unauthorized script sources: [docs/gates/R7-headers.md](docs/gates/R7-headers.md).
- **Supply Chain**: Strictly pinned dependencies with [zero range operators](docs/gates/R7-supply-chain.md) and clean `npm audit`: [docs/gates/R7-supply-chain.md](docs/gates/R7-supply-chain.md).
- **Vulnerability Disclosure Policy**: [SECURITY.md](SECURITY.md).

---

## 5. Testing & CI Pipeline

Continuous Integration enforces strict gates on every pull request via [.github/workflows/ci.yml](.github/workflows/ci.yml).

| Verification Gate | Requirement | Measured Result | Evidence Link |
| :--- | :--- | :--- | :--- |
| **Domain Coverage** | $\ge 80\%$ statement & branch | **96.7% statements, 89.36% branches** | [docs/gates/R8-coverage.md](docs/gates/R8-coverage.md) |
| **Accessibility (axe-core)** | 0 critical violations / route | **0 critical violations across all routes** | [docs/gates/R6-a11y.md](docs/gates/R6-a11y.md) |
| **Load Performance** | 100 VUs, p95 < 500ms, err < 1% | **p95 = 174.5ms, error rate = 0.00%** | [docs/gates/R8-load-report.md](docs/gates/R8-load-report.md) |
| **Flake Audit** | 3× consecutive clean runs | **0 flakes across 3 consecutive runs** | [docs/gates/R8-flake.md](docs/gates/R8-flake.md) |
| **API Boundary Latency** | Warm path p95 < 15ms | **p95 < 1.2ms on warm routes** | [docs/gates/R5-api-verification.md](docs/gates/R5-api-verification.md) |
| **Code Duplication** | < 3% duplication rate | **1.14% duplication** | [docs/gates/R8-refactor.md](docs/gates/R8-refactor.md) |
| **Database Restore RTO** | $\le 30$ minutes RTO | **2.18s restore drill with 100% data parity** | [docs/gates/R8-restore-drill.md](docs/gates/R8-restore-drill.md) |
| **Rollback Execution** | Zero downtime | **4.12s traffic switch** | [docs/gates/R8-deploy.md](docs/gates/R8-deploy.md) |

---

## 6. Feature Flags

Runtime toggles are managed through `src/ui/flags/FlagContext.tsx` and documented in [docs/feature-flags.md](docs/feature-flags.md):

- `ff_generative_ai_hints`: Default `false`. Hard-disabled to prevent prompt-injection threats: [docs/security/prompt-injection.md](docs/security/prompt-injection.md).
- `ff_domain_radar_view`: Default `true`. Renders SVG diagnostic domain breakdown radar.
- `ff_strict_time_limits`: Default `true`. Enforces scenario duration limits.
- `ff_experimental_voice_input`: Default `false`.

---

## 7. Prompt-Engineering Narrative

Rather than attempting to build the platform via an error-prone monolithic prompt, this system was delivered through a 9-role multi-disciplinary software engineering pipeline (Product, Architecture, Database, Domain, API, Frontend, Security, QA, and Documentation). Each role operated under strict falsifiable constraints and verified handoff gates.

Read the full narrative: [docs/prompts-narrative.md](docs/prompts-narrative.md).

---

## 8. Learning-Journey Narrative

CloudFix was engineered to solve the primary deficiency in technical cloud assessment: memorization versus architectural reasoning.
- **Rote Quizzes Fail**: Candidates memorize static question dumps without understanding SLA trade-offs or fault domain isolation.
- **Mathematical Decay Feedback**: Architecture knowledge decays without regular practice. CloudFix models decay over a 14-day half-life, encouraging spaced repetition.
- **Transparent Remediation**: Candidates receive domain-by-domain diagnostic radar scores pinpointing exact conceptual gaps.

---

## 9. Your Data: Privacy, Retention, Export & Deletion

We adhere strictly to privacy-by-design and GDPR principles:
- **90-Day Retention**: Candidate quiz sessions and attempts are automatically hard-purged after 90 days via `pg_cron` jobs: `supabase/migrations/20261019000002_retention.sql`.
- **Machine-Readable Export**: Candidates can export all account data, sessions, and attempts via `GET /api/user/export`: [docs/api-contract.md](docs/api-contract.md).
- **One-Click Right-to-be-Forgotten**: Candidates can irrevocably delete their profile and associated attempts via `DELETE /api/user/account`: [docs/api-contract.md](docs/api-contract.md).
- **Strict PII Redaction**: Passwords, tokens, and candidate answers are filtered by centralized regex sanitizers before logging: [docs/security/logging.md](docs/security/logging.md).

---

## 10. Running Cost & Break-Even Economics

- **Free-Tier Viability**: Operates 100% within Google Cloud Run free tier (2M requests/month) and Supabase free tier (500MB database, 50,000 monthly active users).
- **Scale-to-Zero**: Infrastructure scales to zero instances during idle periods, incurring $0.00 base standby cost.
- **Break-Even Threshold**: At sustained traffic of 100 concurrent candidates, operating cost is estimated at $14.20/month, covered by 2 institutional candidate subscriptions.
Full financial model: [docs/cost-model.md](docs/cost-model.md).

---

## 11. Reliability & Service Level Objectives (SLOs)

- **Availability SLO**: $99.9\%$ monthly uptime ($\le 43.8$ minutes downtime/month): [docs/slo.md](docs/slo.md).
- **Latency SLO**: $95\%$ of API responses served under 500ms (Observed: [174.5ms under 100 VU load](docs/gates/R8-load-report.md)).
- **Disaster Recovery**: Recovery Time Objective (RTO) $\le 30$ minutes (Observed drill: [2.18s](docs/gates/R8-restore-drill.md)); Recovery Point Objective (RPO) $\le 1$ hour.

---

## 12. Copyright & Trademarks Verification

- **Automated Anti-Infringement Gate**: Continuous regression tests verify zero proprietary vendor logo files and zero copyrighted exam questions: [tests/security/copyright-guard.test.ts](tests/security/copyright-guard.test.ts).
- **Workspace Scan Verification**: Automated command confirms clean status:
  ```bash
  grep -riE "microsoft.*logo|logo.*microsoft" src/ || echo "ZERO MATCHES IN SRC"
  ```
  Result: `ZERO MATCHES IN SRC`. Proof: [docs/gates/R7-copyright-review.md](docs/gates/R7-copyright-review.md).
- **Mandatory Footer Assertion**: Automated unit tests assert the presence of *"Unofficial — not affiliated with Microsoft"* on every UI route: [src/ui/components/Disclaimer.test.tsx](src/ui/components/Disclaimer.test.tsx).

---

## 13. License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for complete terms.  
The MIT License was chosen to promote open-source educational access while enabling enterprise adaptability.
