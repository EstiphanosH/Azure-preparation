# ADR-005: Feature Flags Architecture: Runtime Dynamic vs Build-Time Static

## Status
Accepted

## Context
The platform requires feature flags to gate optional modules (such as the 3-tier progressive hint ladder, proctor audit export, and canvas packet animation) and act as instant kill switches during live evaluation if performance degrades or strict testing modes are activated. We must decide between external SaaS flag management, server-side database configuration, or client-side runtime evaluation.

## Decision
We implement a **Dual-Tier Runtime Feature Flag Architecture**: default flag definitions are bundled in static TypeScript contracts in the client bundle, with real-time override capabilities driven by an in-memory Zustand store that synchronizes with a public `feature_flags` table in Supabase via PostgreSQL Realtime WebSocket channels.

## Options Considered

| Option | Pros | Cons | Score (1-5) |
| :--- | :--- | :--- | :--- |
| **Option 1: Dual-Tier Static Defaults with Supabase Realtime Overrides (Chosen)** | Zero external network dependency during offline or disconnected testing; instant sub-millisecond local evaluation; real-time proctor kill switch broadcast in < 25 ms without redeployment. | Requires maintaining both a local TypeScript fallback registry and a remote database configuration table. | **5/5** |
| **Option 2: Commercial Feature Flag SaaS (LaunchDarkly / Statsig)** | Advanced percentage rollouts; multivariate targeting; automated experimentation statistics. | Heavy client SDK (>120 KB bundle impact); introduces external SaaS network dependency; costs exceed hackathon budget; failure of third-party API stalls client hydration. | **2/5** |
| **Option 3: Build-Time Environment Variable Flags (`import.meta.env`)** | Zero runtime overhead; dead-code elimination via bundler tree-shaking. | Impossible to toggle a kill switch in production without triggering a full 2-minute container re-build and redeployment. | **3/5** |

## Trade-offs & What We Lose (The Named Loser)
**The Loser: Commercial Feature Flag Platforms (LaunchDarkly) and Build-Time Bundler Flags.**
By choosing a lightweight dual-tier internal flag system, we lose LaunchDarkly's sophisticated statistical A/B testing, cohort percentage segmentation, and automated canary rollouts. We also lose build-time dead-code elimination: all gated code remains compiled in the client bundle even when disabled, slightly increasing initial JavaScript asset payload by ~12 KB.

## Consequences
- **Positive**: Zero vendor subscription fees; zero external network single point of failure; instantaneous client kill switch execution in < 1 ms.
- **Negative**: Feature flagging is strictly binary (ENABLED / KILLED) per deployment or proctor group, with no automated Bayesian experimentation analysis.
- **Contract Enforcement**: Every flag defined in `docs/feature-flags.md` maps to a registered key in `src/engine/types.ts` and can be toggled without page refresh.
