# ADR-006: Testing Strategy and Automated CI Quality Gates

## Status
Accepted

## Context
Every story in `docs/stories.md` contains strict, quantifiable Acceptance Criteria (ACs) mapped directly to downstream test names (`tests/ac/AC-*.test.ts`). The CI/CD pipeline must enforce these contracts machine-checkably, preventing regressions, vague adjectives, broken type contracts, or unmapped scope from entering production.

## Decision
We implement a **3-Tiered Automated Quality Gate** executed via **Vitest + TSX + Shell Regex Audits** in GitHub Actions:
1. **Gate 1 (Lexical & Specification Audit)**: Grep checks rejecting forbidden vague adjectives (`works well`, `user-friendly`, `fast enough`, `seamless`), verifying `Given` statement multiplicity (≥ 2 × story count), and checking for proprietary vendor trademarks.
2. **Gate 2 (Type & Dependency Verification)**: `tsc --noEmit` with `strict: true` and zero `any` allowance, accompanied by dependency boundary verification ensuring `domain` has zero outer imports.
3. **Gate 3 (Downstream Contract Execution)**: Headless execution of all 14 programmatic Acceptance Criteria tests via Vitest/TSX, enforcing millisecond latency ceilings.

## Options Considered

| Option | Pros | Cons | Score (1-5) |
| :--- | :--- | :--- | :--- |
| **Option 1: 3-Tiered Headless Gate (Vitest + TSX + Regex Audits) (Chosen)** | Completes in ≤ 35 seconds total runtime; zero browser dependencies or flakiness; verifies both code correctness and specification invariants. | Does not execute real cross-browser layout pixel rendering in WebKit/Gecko. | **5/5** |
| **Option 2: Full End-to-End Browser Automation (Playwright / Cypress)** | Tests actual DOM interactions, canvas mouse dragging, and real browser network requests. | Slow execution (3 to 6 minutes); requires heavyweight browser container images; prone to flakiness from animation timing jitter. | **3/5** |
| **Option 3: Legacy Jest + ESLint Only** | Standard historical Node.js testing stack. | Slow TypeScript compilation via ts-jest; lacking regex specification gates; higher CPU memory footprint. | **2/5** |

## Trade-offs & What We Lose (The Named Loser)
**The Loser: Heavyweight End-to-End Browser Automation (Playwright/Cypress).**
By prioritizing fast, deterministic contract tests and regex gates over full Playwright browser orchestration, we lose automated verification of actual browser-level layout rendering (such as verifying that a specific GPU graphics driver correctly anti-aliases an SVG Bézier curve). We rely on contract-level layout coordinate assertions rather than full-page screenshot diffing.

## Consequences
- **Positive**: PR verification runs in under 45 seconds; zero non-deterministic test retries; machine-checkable enforcement of the Product Owner's acceptance gate.
- **Negative**: Visual regressions (e.g. CSS z-index conflicts or font rendering mismatches) must be verified via human inspection or manual smoke tests during the demo path.
- **Enforcement**: Any pull request that fails any of the 3 gates is rejected at the GitHub merge queue.
