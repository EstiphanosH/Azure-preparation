# UI Route Architecture Specification

## Compliance Notice
This application is completely independent and educational. It contains zero vendor trademarks, logos, or proprietary questions. Every screen displays the mandatory notice:
**"Unofficial — not affiliated with Microsoft"**

---

## 1. Route Map & State Definitions

| Route Path | Auth Requirement | Feature Flag Gate | Loading State | Error State | Empty State | Success / Happy State |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`/auth/login`** | Public (Unauthenticated) | None | Button spinner, inputs disabled | Alert role `alert`, invalid credentials text | N/A | Saves JWT, redirects to `/dashboard` |
| **`/auth/register`** | Public (Unauthenticated) | None | Button spinner, inputs disabled | Alert role `alert`, password policy rejection details | N/A | Auto-authenticates, redirects to `/dashboard` |
| **`/dashboard`** | Authenticated (`Bearer <token>`) | None | Card skeleton loader with `aria-busy="true"` | Error banner with Retry CTA button | "No diagnostic sessions completed yet. Start your first session." | Readiness gauge, 3-domain breakdown chart, recent sessions |
| **`/quiz`** | Authenticated (`Bearer <token>`) | None | Loading session spinner with `role="status"` | Session start failure banner | "No questions available in selected domain." | Keyboard-accessible question card (`aria-radiogroup`), instant attempt feedback |
| **`/quiz/results/:id`** | Authenticated (`Bearer <token>`) | None | Results calculation skeleton | Session not found / 404 / 403 RLS denied banner | N/A | Final score percentage, pass/fail badge, domain breakdown |
| **`/sandbox`** | Public | `ff_progressive_hint_ladder` | Canvas initialization spinner | Topology load failure alert | N/A | Interactive SVG topology with keyboard-navigable node inspector and patch editor |

---

## 2. Accessibility & Keyboard Invariants
1. **Zero Critical Violations**: Every rendered screen passes `axe-core` analysis with 0 critical and 0 serious accessibility violations.
2. **Keyboard Navigation (`Tab`, `Space`, `Enter`, `1-4`)**: The full quiz flow (login, question selection, option choice, submit attempt, next question, and finalize) can be navigated and submitted using only the keyboard.
3. **Screen Reader Live Regions**: Errors, loading indicators, and attempt feedback use `role="alert"` and `aria-live="polite"`.
4. **Contrast Compliance**: Minimum 4.5:1 contrast ratio across all text and interactive controls.
