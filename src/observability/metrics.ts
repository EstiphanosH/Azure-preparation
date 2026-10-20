export interface HistogramBucket {
  readonly le: number;
  count: number;
}

export class MetricsCollector {
  private requestCounters = new Map<string, number>();
  private errorCounters = new Map<string, number>();
  private durationSamples = new Map<string, number[]>();

  public incrementRequests(endpoint: string, status: number): void {
    const key = `${endpoint}:${status}`;
    const curr = this.requestCounters.get(key) || 0;
    this.requestCounters.set(key, curr + 1);
  }

  public incrementErrors(endpoint: string, errorKind: string): void {
    const key = `${endpoint}:${errorKind}`;
    const curr = this.errorCounters.get(key) || 0;
    this.errorCounters.set(key, curr + 1);
  }

  public observeDuration(endpoint: string, durationMs: number): void {
    const samples = this.durationSamples.get(endpoint) || [];
    samples.push(durationMs);
    this.durationSamples.set(endpoint, samples);
  }

  public getP95Latency(endpoint: string): number {
    const samples = this.durationSamples.get(endpoint);
    if (!samples || samples.length === 0) return 0;
    const sorted = [...samples].sort((a, b) => a - b);
    const p95Index = Math.floor(sorted.length * 0.95);
    const p95Val = sorted[Math.min(p95Index, sorted.length - 1)];
    return p95Val ?? 0;
  }

  public getMetricsSummary(): Record<string, { totalRequests: number; p95Ms: number }> {
    const summary: Record<string, { totalRequests: number; p95Ms: number }> = {};
    for (const [endpoint, samples] of this.durationSamples.entries()) {
      summary[endpoint] = {
        totalRequests: samples.length,
        p95Ms: Number(this.getP95Latency(endpoint).toFixed(2)),
      };
    }
    return summary;
  }
}

export const metrics = new MetricsCollector();
