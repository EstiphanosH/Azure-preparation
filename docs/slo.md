# Service Level Objectives (SLOs) & Error Budget Policy

## Scope & Compliance
This policy defines the formal Service Level Indicators (SLIs), Service Level Objectives (SLOs), and Error Budgets for the CloudFix platform over a rolling 30-day compliance window. Every SLO maps directly to the telemetry signals defined in `docs/nfr.md` §6, §7, and §11.

---

## 1. SLO Matrix

| SLO ID | Objective Name | Target Threshold (30-day Rolling) | Service Level Indicator (SLI) Formula | Telemetry Signal Source (per docs/nfr.md) | 30-Day Error Budget |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **SLO-01** | **API Availability & Health** | **≥ 99.90%** of non-synthetic HTTP requests return status code `< 500` | $\frac{\sum \text{rate}(http\_requests\_total\{status!=\sim "5.."\} [5m])}{\sum \text{rate}(http\_requests\_total[5m])} \ge 0.999$ | Metric: `http_requests_total` emitted by Cloud Run & PostgREST proxy (NFR §5, §11) | **0.10%** (43.2 minutes of total allowable downtime per month) |
| **SLO-02** | **Diagnostic Ingestion & Patch Mutation Latency** | **≥ 95.00%** of scenario reads and patch writes complete in **≤ 65 ms** | $\frac{\sum \text{rate}(http\_request\_duration\_seconds\_bucket\{endpoint=\sim "/rest/v1/(scenarios\vert session\_patches)",le="0.065"\}[5m])}{\sum \text{rate}(http\_requests\_total\{endpoint=\sim "/rest/v1/(scenarios\vert session\_patches)"\}[5m])} \ge 0.950$ | Prometheus Histogram: `http_request_duration_seconds_bucket` (NFR §1, §3) | **5.00%** of total requests (50,000 slow requests per 1,000,000 requests) |
| **SLO-03** | **Row Level Security (RLS) Denial Correctness** | **100.00%** of unauthorized cross-tenant data requests trigger HTTP `403` or empty arrays (zero `500` leaks or unauthenticated reads) | $\frac{\sum \text{rate}(http\_requests\_total\{status="403",reason="rls\_violation"\}[5m])}{\sum \text{rate}(http\_requests\_total\{reason="rls\_violation"\}[5m])} == 1.000$ | Metric: `http_requests_total{reason="rls_violation"}` and structured audit logs (NFR §7) | **0.00%** (Zero tolerance; any unauthenticated leak is a Sev-0 security breach) |
| **SLO-04** | **Client Core Web Vitals Responsiveness** | **≥ 98.00%** of user sessions experience First Input Delay (FID) **≤ 50 ms** and Cumulative Layout Shift (CLS) **≤ 0.05** | $\frac{\sum \text{rate}(rum\_web\_vitals\_bucket\{metric="FID",le="0.05"\}[5m])}{\sum \text{rate}(rum\_web\_vitals\_total\{metric="FID"\}[5m])} \ge 0.980$ | Client-side RUM metric collector forwarding to `/telemetry/vitals` (NFR §10) | **2.00%** of sessions (~20 sessions per 1,000 user attempts) |

---

## 2. Error Budget Burn Rate & Automated Alerting Policy

We enforce multi-window multi-burn-rate alerting to detect service degradation before the 30-day budget is exhausted:

| Alert Severity | Burn Rate Multiplier | Time Window | Error Budget Consumed | Paging Action & Mitigation Trigger |
| :--- | :--- | :--- | :--- | :--- |
| **Page (Critical / Sev-1)** | **14.4×** | 1 hour | 2% of budget in 1 hour | On-call engineer paged immediately; halt all active feature deployments; initiate rollback to last stable SHA. |
| **Page (High / Sev-2)** | **6.0×** | 6 hours | 5% of budget in 6 hours | On-call engineer paged; investigate Supavisor pool exhaustion and slow database query locks. |
| **Ticket (Medium / Sev-3)** | **1.0×** | 3 days | 10% of budget in 3 days | Create Jira incident ticket; investigate background query optimizations and edge caching hit ratios. |

---

## 3. Scope Freeze & Feature Freeze Triggers
If any SLO error budget drops below **20% remaining** within a rolling 30-day period:
1. **Immediate Scope Freeze**: All roadmap development and PR merges for non-critical features are frozen.
2. **Mandatory Tech Debt Allocation**: 100% of engineering bandwidth is redirected toward database indexing, connection pool tuning, and query optimization until the error budget recovers above 50%.
