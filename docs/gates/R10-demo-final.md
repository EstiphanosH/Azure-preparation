# Demo Script Finalization & Verification (R10)

## 1. Compliance Constraints
- **Maximum Script Duration**: $\le 3:00$ (180 seconds).
- **Mandatory Requirements**:
  - **Beat A**: Live gate artifact presentation (k6 concurrency report and DR drill).
  - **Beat B**: Pipeline diagram presentation (9-role engineering architecture).
  - Every click and claim must cite an existing, verified gate file in the repository.

---

## 2. Beat-by-Beat Audit & Verification Matrix

| Beat ID | Label & Focus | Duration | Gate File Cited | File Exists? | Rehearsal Timing |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Beat 1** | **Beat B: Pipeline Diagram** & Project Introduction | 25s | [docs/gates/R7-copyright-review.md](docs/gates/R7-copyright-review.md), [docs/prompts-narrative.md](docs/prompts-narrative.md) | **YES** | 0:00 - 0:25 |
| **Beat 2** | Candidate Auth & Password Enforcement | 25s | [docs/gates/R5-api-verification.md](docs/gates/R5-api-verification.md), [docs/security/threat-model.md](docs/security/threat-model.md) | **YES** | 0:25 - 0:50 |
| **Beat 3** | Assessment & Keyboard a11y Walkthrough | 35s | [docs/gates/R6-a11y.md](docs/gates/R6-a11y.md), [docs/gates/R6-domain-boundary.md](docs/gates/R6-domain-boundary.md) | **YES** | 0:50 - 1:25 |
| **Beat 4** | Scoring Engine & Half-Life Decay Radar | 30s | [docs/gates/R4-ac-traceability.md](docs/gates/R4-ac-traceability.md), [docs/domain/readiness-formula.md](docs/domain/readiness-formula.md) | **YES** | 1:25 - 1:55 |
| **Beat 5** | Multi-Tenant RLS & IDOR Denial | 25s | [docs/gates/R6-e2e.md](docs/gates/R6-e2e.md), [docs/security/owasp-review.md](docs/security/owasp-review.md) | **YES** | 1:55 - 2:20 |
| **Beat 6** | **Beat A: Live Gate Artifacts** (k6 Load & DR Drill) | 30s | [docs/gates/R8-load-report.md](docs/gates/R8-load-report.md), [docs/gates/R8-restore-drill.md](docs/gates/R8-restore-drill.md) | **YES** | 2:20 - 2:50 |

---

## 3. Total Time Verification
- Cumulative read-aloud duration: **2 minutes 50 seconds** (170 seconds).
- Remaining safety margin: **10 seconds** under the 3:00 threshold.
- Verified by: Release Orchestrator R10.

**VERDICT: PASS**.
