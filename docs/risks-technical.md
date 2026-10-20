# Technical Risk Register & Quantitative Scope Cut Triggers

## Scope
This register tracks 6 fundamental technical risks that threaten system latency, concurrency, reliability, or compliance under a 100-concurrent-user load. Every risk includes an explicit quantitative threshold triggering immediate scope reduction.

---

## Technical Risk Table

| Risk ID | Technical Risk Description | Likelihood | Impact | Architectural Mitigation Strategy | Quantitative Trigger to Cut Scope |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TRSK-01** | **Supavisor Connection Starvation during Synchronized Cohort Start** | Med | High | Configure Supavisor in transaction pooling mode with client statement timeout clamped to 3000 ms. | **If pooled connection checkout latency exceeds 25 ms for > 30 consecutive seconds**, immediately disable background audit pre-fetching and force read queries to edge cache. |
| **TRSK-02** | **Complex PostgreSQL RLS Subquery Latency Degradation** | Med | High | Replace subquery RLS policies (`WHERE user_id IN (SELECT ...)`) with direct foreign key denormalization or indexed security definer functions. | **If p95 patch INSERT latency exceeds 80 ms over a 5-minute window**, immediately cut dynamic RLS join validation and enforce session ownership via indexed parent session ID check. |
| **TRSK-03** | **Client Canvas DOM Reflow Thrashing on Viewport Resize** | Med | Med | Render topology via pure vector SVG coordinate system with fixed viewBox (`0 0 840 280`) without DOM element resizing. | **If client render frame rate drops below 45 FPS during canvas drag**, immediately kill dynamic packet flow animation (`ff_edge_packet_animation = false`) and lock nodes to static coordinates. |
| **TRSK-04** | **Edge Function Cold Start Latency Spike on Finalization** | Low | High | Precompile session finalization logic into an in-database PostgreSQL stored procedure (`rpc/finalize_diagnostic_session`) rather than external edge function runtime. | **If finalization RPC execution time exceeds 100 ms on test fixture**, bypass Edge Function layer and write directly to `verification_audit_logs` table via PostgREST. |
| **TRSK-05** | **Browser Memory Leak from Long-Lived Undo/Redo State History** | Low | Med | Clamp immutable patch history stack to maximum 25 items in Zustand store; purge transient snapshots upon scenario resolution. | **If client heap memory consumption exceeds 120 MB in Chrome DevTools allocation profiler**, purge all undo history slices except the initial and final states. |
| **TRSK-06** | **Third-Party CDN Cache Staleness for Updated Scenarios** | Low | Med | Implement cache-busting versioned URLs (`/scenarios?v=${hash}`) combined with explicit HTTP `ETag` conditional validation. | **If scenario definition version mismatch is reported by > 1 candidate**, disable CDN edge caching entirely (`Cache-Control: no-cache, must-revalidate`) and serve scenarios directly from PostgreSQL. |
