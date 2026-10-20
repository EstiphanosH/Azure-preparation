# 3-Minute Live Evaluation Demo Script (Timestamped Beats)

**Total Duration**: 2 minutes 50 seconds ($\le$ 3:00 maximum limit).  
**Presenter Goal**: Guide evaluators through candidate assessment flow, demonstrate the 9-role pipeline diagram (Beat B), prove zero-trust architectural isolation, and present live gate artifact outputs (Beat A).

---

### Beat 1 (Beat B): Project Introduction & 9-Role Pipeline Blueprint Diagram
- **Timestamp**: `0:00 - 0:25` (25 seconds)
- **Click**: Open browser at root URL (`/`). Point to the top compliance banner disclaimer, fixed footer, and the 9-role pipeline diagram in the Architecture tab.
- **Say**: 
  > "Welcome to CloudFix Architect Readiness Simulator. This is a production-grade diagnostic assessment engine designed to evaluate cloud architects with mathematical rigor. Notice our mandatory disclaimer: this platform is completely unofficial and independent, containing zero proprietary vendor logos, zero braindumps, and zero copyrighted exam questions. Our entire architecture was constructed through an adversarial 9-role pipeline from Product Owner down to Release Orchestration."
- **Cite Gate File**: [docs/gates/R7-copyright-review.md](docs/gates/R7-copyright-review.md), [docs/gates/R6-a11y.md](docs/gates/R6-a11y.md) & [docs/prompts-narrative.md](docs/prompts-narrative.md)

---

### Beat 2: Candidate Registration & Password Policy Enforcement
- **Timestamp**: `0:25 - 0:50` (25 seconds)
- **Click**: Switch to Assessment Simulator, type `candidate_demo@cloudfix.edu`, enter an insecure password `12345` (observe instant server-side rejection), then enter compliant `P@sswordEnterprise2026!` and submit.
- **Say**: 
  > "Authentication enforces enterprise security at both client and server boundaries. The server rejects weak credentials using Zod strict schemas. Upon registration, the candidate receives an ephemeral access token and refresh token with automated single-flight deduplication."
- **Cite Gate File**: [docs/gates/R5-api-verification.md](docs/gates/R5-api-verification.md) & [docs/security/threat-model.md](docs/security/threat-model.md)

---

### Beat 3: Diagnostic Assessment & Keyboard-Only Accessibility
- **Timestamp**: `0:50 - 1:25` (35 seconds)
- **Click**: Click `Start New Diagnostic Session`. Put mouse away, press `Tab` to navigate through question radio options, select an answer with `Space`, and press `Enter` to advance through scenarios.
- **Say**: 
  > "Here is our assessment engine. Every screen achieves zero critical axe-core accessibility violations. The entire quiz flow can be operated exclusively via keyboard with visible focus outlines and semantic ARIA landmarks. Notice that scoring calculations do not happen in React state—every answer is securely sent to the backend API."
- **Cite Gate File**: [docs/gates/R6-a11y.md](docs/gates/R6-a11y.md) & [docs/gates/R6-domain-boundary.md](docs/gates/R6-domain-boundary.md)

---

### Beat 4: Scoring Engine & Domain Readiness Radar
- **Timestamp**: `1:25 - 1:55` (30 seconds)
- **Click**: Click `Finalize Session`. The screen routes to `/results`, displaying the Readiness Gauge (e.g., 78% 'NEAR READY') and the 5-domain score breakdown chart.
- **Say**: 
  > "When the session is finalized, our pure domain engine in `src/domain` applies our half-life decay formula, weighting recent attempts higher than old ones. It computes composite scores across Architecture, Security, Storage, Networking, and Monitoring, providing actionable diagnostic feedback."
- **Cite Gate File**: [docs/gates/R4-ac-traceability.md](docs/gates/R4-ac-traceability.md) & [docs/domain/readiness-formula.md](docs/domain/readiness-formula.md)

---

### Beat 5: Multi-Tenant RLS Security & IDOR Denial
- **Timestamp**: `1:55 - 2:20` (25 seconds)
- **Click**: Open Quality Gates tab, trigger the RLS-negative test where User B attempts to access or submit answers to User A's session.
- **Say**: 
  > "To prove multi-tenant isolation, our security test suite attacks the database. When User B attempts to hijack User A's session using direct REST calls, PostgreSQL Row-Level Security blocks the write immediately with HTTP 401 Unauthorized. Unowned records are invisible."
- **Cite Gate File**: [docs/gates/R6-e2e.md](docs/gates/R6-e2e.md) & [docs/security/owasp-review.md](docs/security/owasp-review.md)

---

### Beat 6 (Beat A): Live Gate Artifact — k6 Concurrency Report & Disaster Recovery Drill
- **Timestamp**: `2:20 - 2:50` (30 seconds)
- **Click**: Click Quality Gates $\rightarrow$ `R8: High Concurrency Load Report` to inspect the raw JSON load report, then click `R8: Disaster Recovery Drill`.
- **Say**: 
  > "Here is our live gate evidence. Under 100 concurrent virtual users, our k6 load run processed 44,000 requests at a p95 latency of 174.5 milliseconds against our 500 millisecond budget, with a 0.00% error rate. Our disaster recovery drill completed a full database dump and restore in 2.18 seconds with 100% data integrity."
- **Cite Gate File**: [docs/gates/R8-load-report.md](docs/gates/R8-load-report.md), [docs/gates/R8-restore-drill.md](docs/gates/R8-restore-drill.md) & [docs/gates/R10-scalability-release.md](docs/gates/R10-scalability-release.md)

---

**Total Time Elapsed**: **2 minutes 50 seconds** (Verified $\le$ 3:00).
