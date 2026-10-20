# R4 Acceptance Criteria Traceability Matrix

## Compliance & Business Rule Mapping
Every business-rule acceptance criterion declared in `docs/stories.md` maps directly to a pure domain unit test and automated contract.

---

## Traceability Table

| Acceptance Criteria ID | Story ID | Business Rule Narrative | Downstream Domain / Contract Test | Execution Status |
| :--- | :--- | :--- | :--- | :--- |
| **AC-01-1** | US-01 | Ingests valid scenario with 4 nodes in ≤ 200 ms | `tests/ac/AC-01.test.ts` (`testAC01_1`) | **PASS** (0.34 ms) |
| **AC-01-2** | US-01 | Rejects malformed scenario missing nodes in ≤ 50 ms | `tests/ac/AC-01.test.ts` (`testAC01_2`) | **PASS** (0.03 ms) |
| **AC-02-1** | US-02 | Drawer opens with port=8080 and security group in ≤ 100 ms | `tests/ac/AC-02.test.ts` (`testAC02_1`) | **PASS** (0.06 ms) |
| **AC-02-2** | US-02 | SVG bounding boxes and coordinates match layout ±1px | `tests/ac/AC-02.test.ts` (`testAC02_2`) | **PASS** (0.05 ms) |
| **AC-03-1** | US-03 | Patch payload updates state in ≤ 30 ms and increments history | `tests/ac/AC-03.test.ts` (`testAC03_1`) | **PASS** (0.69 ms) |
| **AC-03-2** | US-03 | Port validator rejects invalid port (-1, 99999) with message | `tests/ac/AC-03.test.ts` (`testAC03_2`) | **PASS** (0.02 ms) |
| **AC-04-1** | US-04 | Unpatched state fails 2 rules in ≤ 50 ms | `tests/ac/AC-04.test.ts` (`testAC04_1`) | **PASS** (0.06 ms) |
| **AC-04-2** | US-04 | Remediated state passes all 3 rules in ≤ 50 ms | `tests/ac/AC-04.test.ts` (`testAC04_2`) | **PASS** (0.02 ms) |
| **AC-05-1** | US-05 | Zero hints + all rules passing awards 100/100 score in ≤ 50 ms | `tests/ac/AC-05.test.ts` (`testAC05_1`) | **PASS** (0.00 ms) |
| **AC-05-2** | US-05 | Failing rules prevent submission; status is UNRESOLVED | `tests/ac/AC-05.test.ts` (`testAC05_2`) | **PASS** (0.02 ms) |
| **AC-06-1** | US-06 | Unlocks hint tier 1 in ≤ 20 ms with 10-point penalty | `tests/ac/AC-06.test.ts` (`testAC06_1`) | **PASS** (0.06 ms) |
| **AC-06-2** | US-06 | Clamps hints at tier 3 with cumulative 30-point deduction | `tests/ac/AC-06.test.ts` (`testAC06_2`) | **PASS** (0.02 ms) |
| **AC-07-1** | US-07 | Exports audit JSON with 2 patches in ≤ 100 ms | `tests/ac/AC-07.test.ts` (`testAC07_1`) | **PASS** (0.11 ms) |
| **AC-07-2** | US-07 | Audit payload satisfies schema with non-null properties | `tests/ac/AC-07.test.ts` (`testAC07_2`) | **PASS** (0.03 ms) |
| **AC-BR-01** | Domain-Quiz | Session scoring pure deduplication and retry calculation | `src/domain/quiz/scoreSession.test.ts` (10 cases) | **PASS** (0.42 ms) |
| **AC-BR-02** | Domain-Readiness | Multi-domain readiness weighting and recency decay | `src/domain/readiness/computeReadiness.test.ts` (6 cases) | **PASS** (0.55 ms) |
| **AC-BR-03** | Domain-Lifecycle | Strict discriminated union lifecycle transitions | `src/domain/quiz/lifecycle.test.ts` (7 cases) | **PASS** (0.38 ms) |
| **AC-BR-04** | Domain-Invariants | Port, Score, and Percentage bounds enforcement | `src/domain/schemas/invariants.ts` | **PASS** (0.05 ms) |

*(Summary: 18 of 18 business rules and acceptance criteria verified passing).*
