# ADR-001: Frontend Framework and Client State Management

## Status
Accepted

## Context
The CloudFix platform requires an interactive 2D topology debugger that renders cloud infrastructure graphs, handles instantaneous configuration patches, executes deterministic diagnostic verification rules in ≤ 50 ms, and runs smoothly on standard evergreen browsers during high-stakes evaluations. The state management solution must isolate server-persisted session data from rapid in-memory topology mutations without frame drops.

## Decision
We select **React 19 with Vite** as the frontend build toolchain, combined with **Zustand** for transient client-side topology mutation state and **TanStack Query v5** for server-synchronized data fetching and caching.

## Options Considered

| Option | Pros | Cons | Score (1-5) |
| :--- | :--- | :--- | :--- |
| **Option 1: React 19 + Vite + Zustand + TanStack Query (Chosen)** | Sub-second HMR in dev; zero server cold starts in production; immutable Zustand slices provide sub-millisecond patch dispatch; clear separation of server cache and local UI state. | Client bundle must be downloaded before first canvas render; no out-of-the-box edge SSR. | **5/5** |
| **Option 2: Next.js 15 App Router + Server Actions** | Built-in SSR and SEO route handlers; unified full-stack TypeScript framework. | Server action serialization adds 40-100 ms network hops per configuration tweak; heavier bundle; complex hydration reconciliation on SVG canvases. | **3/5** |
| **Option 3: React 19 + Redux Toolkit (RTK)** | Industry-standard centralized state store with robust devtools and action replay. | Verbose action/reducer boilerplate; immutable serialization creates garbage collection overhead during rapid slider or port updates. | **3/5** |

## Trade-offs & What We Lose (The Named Loser)
**The Loser: Next.js App Router and Redux Toolkit.**
By selecting React 19 SPA on Vite with Zustand, we forfeit built-in server-side rendering (SSR) and edge HTML generation. Initial page loads require client-side script evaluation before the interactive canvas displays. We also lose Redux's strict action-stream audit trail, meaning developers cannot export and replay serialized Redux action timelines without building bespoke state logging tools.

## Consequences
- **Positive**: Sub-2-second build pipelines; zero server-side hydration mismatches on SVG topology elements; instant (< 1 ms) in-memory patch evaluations.
- **Negative**: Initial HTML response contains only the SPA mount div; static search engine crawlers cannot index dynamic scenario graph states without pre-rendering scripts.
- **Compliance**: Adheres strictly to the 100-concurrent-user low-latency requirement by shifting all interactive calculations to the client runtime.
