# ADR-007: Observability Architecture: OpenTelemetry + Prometheus vs Commercial APM

## Status
Accepted

## Context
Operating the CloudFix platform under a 100-concurrent-user load requires comprehensive visibility into request latency distributions (p50, p95), database connection pool utilization, error rates, and client-side Real User Monitoring (RUM) Web Vitals. We must adopt an observability strategy that avoids expensive vendor lock-in while providing actionable telemetry.

## Decision
We select **OpenTelemetry (OTel) TypeScript SDK with Structured JSON Logs and Prometheus Metric Formats**. Server-side metrics are exposed at a `/metrics` Prometheus endpoint, application events emit single-line structured JSON records containing W3C trace IDs to `stdout`, and client-side RUM metrics forward Core Web Vitals (LCP, FID, CLS) to an in-memory aggregation endpoint.

## Options Considered

| Option | Pros | Cons | Score (1-5) |
| :--- | :--- | :--- | :--- |
| **Option 1: OpenTelemetry + Prometheus Metrics + Structured JSON (Chosen)** | Open standard; zero licensing fees; zero proprietary agent overhead; easily ingested by Grafana, GCP Cloud Logging, or AWS CloudWatch. | Requires manual dashboard configuration and alert definition; no out-of-the-box AI root-cause analysis. | **5/5** |
| **Option 2: Commercial APM Suite (Datadog / New Relic)** | Rich turn-key dashboards; automated anomaly detection; integrated distributed tracing out of the box. | High recurring per-host costs; proprietary agent binary increases container attack surface and memory footprint; vendor lock-in. | **3/5** |
| **Option 3: Sentry-Only Error Tracking** | Excellent client-side JavaScript stack trace capture and release tracking. | Inadequate for database connection pool monitoring, throughput metering, or calculating p95 request duration histograms. | **3/5** |

## Trade-offs & What We Lose (The Named Loser)
**The Loser: Commercial APM Providers (Datadog).**
By choosing standard OpenTelemetry and Prometheus formats, we lose Datadog's proprietary automated infrastructure maps, synthetic canary monitors, and automated root-cause ML anomaly detectors. The operations team must explicitly design metric recording rules and configure alert thresholds in Grafana or GCP Monitoring.

## Consequences
- **Positive**: 100% vendor-agnostic architecture; telemetry data can be piped to any cloud log router without application code changes; minimal CPU runtime overhead (< 1%).
- **Negative**: Engineering time must be invested in building Prometheus recording queries and alert rules.
- **Log Schema Standard**:
  `{"timestamp":"ISO8601","level":"INFO|WARN|ERROR","trace_id":"...","span_id":"...","endpoint":"/rest/v1/...","status":200,"duration_ms":14.2,"user_id_hash":"..."}`
