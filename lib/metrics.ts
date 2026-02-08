// Performance metrics utility for measuring database and cache performance

interface QueryMetric {
  operation: string;
  latencyMs: number;
  fromCache: boolean;
  timestamp: Date;
}

interface MetricsSummary {
  totalQueries: number;
  cacheHits: number;
  cacheMisses: number;
  cacheHitRate: string;
  avgLatencyMs: number;
  avgCacheLatencyMs: number;
  avgDbLatencyMs: number;
  p50LatencyMs: number;
  p95LatencyMs: number;
  p99LatencyMs: number;
}

interface BaselineSnapshot {
  summary: MetricsSummary;
  capturedAt: string;
  label: string;
}

interface PerformanceComparison {
  baseline: BaselineSnapshot;
  current: MetricsSummary & { capturedAt: string };
  improvements: {
    avgLatencyChange: string;
    cacheHitRateChange: string;
    p50Change: string;
    p95Change: string;
    p99Change: string;
    cacheLatencyReduction: string;
    throughputImprovement: string;
  };
  summary: string;
}

class PerformanceMetrics {
  private metrics: QueryMetric[] = [];
  private maxMetrics = 1000; // Keep last 1000 metrics
  private baseline: BaselineSnapshot | null = null;

  /**
   * Record a query metric
   */
  record(operation: string, latencyMs: number, fromCache: boolean = false) {
    this.metrics.push({
      operation,
      latencyMs,
      fromCache,
      timestamp: new Date(),
    });

    // Keep only last maxMetrics entries
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
  }

  /**
   * Measure execution time of an async function
   */
  async measure<T>(
    operation: string,
    fn: () => Promise<T>,
    fromCache: boolean = false
  ): Promise<{ result: T; latencyMs: number }> {
    const startTime = performance.now();
    const result = await fn();
    const latencyMs = performance.now() - startTime;
    
    this.record(operation, latencyMs, fromCache);
    
    return { result, latencyMs };
  }

  /**
   * Capture current metrics as baseline for comparison
   */
  captureBaseline(label: string = "Before Optimization"): BaselineSnapshot {
    this.baseline = {
      summary: this.getSummary(),
      capturedAt: new Date().toISOString(),
      label,
    };
    return this.baseline;
  }

  /**
   * Get the stored baseline
   */
  getBaseline(): BaselineSnapshot | null {
    return this.baseline;
  }

  /**
   * Set baseline from external data (e.g., from storage)
   */
  setBaseline(baseline: BaselineSnapshot) {
    this.baseline = baseline;
  }

  /**
   * Compare current metrics against baseline
   */
  compareWithBaseline(): PerformanceComparison | null {
    if (!this.baseline) {
      return null;
    }

    const current = this.getSummary();
    const base = this.baseline.summary;

    // Calculate percentage changes (negative = improvement for latency)
    const calcChange = (before: number, after: number): string => {
      if (before === 0) return "N/A";
      const change = ((after - before) / before) * 100;
      const sign = change > 0 ? "+" : "";
      return `${sign}${change.toFixed(1)}%`;
    };

    // For latency, negative is better
    const calcLatencyImprovement = (before: number, after: number): string => {
      if (before === 0) return "N/A";
      const reduction = ((before - after) / before) * 100;
      return reduction > 0 ? `${reduction.toFixed(1)}% faster` : `${Math.abs(reduction).toFixed(1)}% slower`;
    };

    // Parse cache hit rate
    const parseRate = (rate: string): number => parseFloat(rate.replace("%", "")) || 0;
    const baseCacheRate = parseRate(base.cacheHitRate);
    const currentCacheRate = parseRate(current.cacheHitRate);

    const improvements = {
      avgLatencyChange: calcLatencyImprovement(base.avgLatencyMs, current.avgLatencyMs),
      cacheHitRateChange: `${baseCacheRate.toFixed(1)}% → ${currentCacheRate.toFixed(1)}% (${currentCacheRate > baseCacheRate ? "+" : ""}${(currentCacheRate - baseCacheRate).toFixed(1)}pp)`,
      p50Change: calcLatencyImprovement(base.p50LatencyMs, current.p50LatencyMs),
      p95Change: calcLatencyImprovement(base.p95LatencyMs, current.p95LatencyMs),
      p99Change: calcLatencyImprovement(base.p99LatencyMs, current.p99LatencyMs),
      cacheLatencyReduction: base.avgCacheLatencyMs > 0 && current.avgCacheLatencyMs > 0
        ? calcLatencyImprovement(base.avgDbLatencyMs, current.avgCacheLatencyMs)
        : "N/A",
      throughputImprovement: base.avgLatencyMs > 0 && current.avgLatencyMs > 0
        ? `${((base.avgLatencyMs / current.avgLatencyMs - 1) * 100).toFixed(1)}% more requests/sec`
        : "N/A",
    };

    // Generate summary for resume
    const summary = this.generateResumeSummary(base, current, improvements);

    return {
      baseline: this.baseline,
      current: {
        ...current,
        capturedAt: new Date().toISOString(),
      },
      improvements,
      summary,
    };
  }

  /**
   * Generate a resume-friendly summary
   */
  private generateResumeSummary(
    base: MetricsSummary,
    current: MetricsSummary,
    improvements: PerformanceComparison["improvements"]
  ): string {
    const lines: string[] = [];
    
    // Cache hit rate improvement
    const baseCacheRate = parseFloat(base.cacheHitRate) || 0;
    const currentCacheRate = parseFloat(current.cacheHitRate) || 0;
    if (currentCacheRate > baseCacheRate) {
      lines.push(`• Achieved ${currentCacheRate.toFixed(0)}% cache hit rate with Redis caching`);
    }

    // Latency reduction
    if (base.avgLatencyMs > current.avgLatencyMs) {
      const reduction = ((base.avgLatencyMs - current.avgLatencyMs) / base.avgLatencyMs * 100).toFixed(0);
      lines.push(`• Reduced average API latency by ${reduction}% (${base.avgLatencyMs.toFixed(0)}ms → ${current.avgLatencyMs.toFixed(0)}ms)`);
    }

    // Cache vs DB comparison
    if (current.avgCacheLatencyMs > 0 && current.avgDbLatencyMs > 0) {
      const speedup = (current.avgDbLatencyMs / current.avgCacheLatencyMs).toFixed(1);
      lines.push(`• Cache responses ${speedup}x faster than database queries`);
    }

    // P95 improvement
    if (base.p95LatencyMs > current.p95LatencyMs) {
      const reduction = ((base.p95LatencyMs - current.p95LatencyMs) / base.p95LatencyMs * 100).toFixed(0);
      lines.push(`• Improved P95 latency by ${reduction}%`);
    }

    return lines.length > 0 
      ? lines.join("\n")
      : "Collect more metrics to generate comparison summary";
  }

  /**
   * Get summary statistics
   */
  getSummary(): MetricsSummary {
    if (this.metrics.length === 0) {
      return {
        totalQueries: 0,
        cacheHits: 0,
        cacheMisses: 0,
        cacheHitRate: "0%",
        avgLatencyMs: 0,
        avgCacheLatencyMs: 0,
        avgDbLatencyMs: 0,
        p50LatencyMs: 0,
        p95LatencyMs: 0,
        p99LatencyMs: 0,
      };
    }

    const cacheHits = this.metrics.filter((m) => m.fromCache);
    const cacheMisses = this.metrics.filter((m) => !m.fromCache);
    
    const sortedLatencies = [...this.metrics]
      .map((m) => m.latencyMs)
      .sort((a, b) => a - b);

    const cacheLatencies = cacheHits.map((m) => m.latencyMs);
    const dbLatencies = cacheMisses.map((m) => m.latencyMs);

    return {
      totalQueries: this.metrics.length,
      cacheHits: cacheHits.length,
      cacheMisses: cacheMisses.length,
      cacheHitRate: `${((cacheHits.length / this.metrics.length) * 100).toFixed(1)}%`,
      avgLatencyMs: this.average(sortedLatencies),
      avgCacheLatencyMs: this.average(cacheLatencies),
      avgDbLatencyMs: this.average(dbLatencies),
      p50LatencyMs: this.percentile(sortedLatencies, 50),
      p95LatencyMs: this.percentile(sortedLatencies, 95),
      p99LatencyMs: this.percentile(sortedLatencies, 99),
    };
  }

  /**
   * Get metrics for a specific operation
   */
  getOperationMetrics(operation: string): MetricsSummary {
    const filtered = this.metrics.filter((m) => m.operation === operation);
    const temp = new PerformanceMetrics();
    temp.metrics = filtered;
    return temp.getSummary();
  }

  /**
   * Get recent metrics
   */
  getRecent(count: number = 10): QueryMetric[] {
    return this.metrics.slice(-count);
  }

  /**
   * Clear all metrics
   */
  clear() {
    this.metrics = [];
  }

  /**
   * Clear baseline
   */
  clearBaseline() {
    this.baseline = null;
  }

  /**
   * Export metrics as JSON
   */
  export() {
    const comparison = this.compareWithBaseline();
    return {
      summary: this.getSummary(),
      recentMetrics: this.getRecent(50),
      baseline: this.baseline,
      comparison: comparison,
      timestamp: new Date().toISOString(),
    };
  }

  private average(arr: number[]): number {
    if (arr.length === 0) return 0;
    return Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 100) / 100;
  }

  private percentile(arr: number[], p: number): number {
    if (arr.length === 0) return 0;
    const index = Math.ceil((p / 100) * arr.length) - 1;
    return Math.round(arr[Math.max(0, index)] * 100) / 100;
  }
}

// Global singleton instance
const globalForMetrics = global as unknown as { metrics?: PerformanceMetrics };

export const metrics = globalForMetrics.metrics || new PerformanceMetrics();

if (process.env.NODE_ENV !== "production") {
  globalForMetrics.metrics = metrics;
}

// Helper for logging metrics to console
export function logMetrics(label: string = "Performance Metrics") {
  const summary = metrics.getSummary();
  console.log(`\n=== ${label} ===`);
  console.log(`Total Queries: ${summary.totalQueries}`);
  console.log(`Cache Hits: ${summary.cacheHits} | Misses: ${summary.cacheMisses}`);
  console.log(`Cache Hit Rate: ${summary.cacheHitRate}`);
  console.log(`Avg Latency: ${summary.avgLatencyMs}ms`);
  console.log(`  - Cache: ${summary.avgCacheLatencyMs}ms`);
  console.log(`  - DB: ${summary.avgDbLatencyMs}ms`);
  console.log(`P50: ${summary.p50LatencyMs}ms | P95: ${summary.p95LatencyMs}ms | P99: ${summary.p99LatencyMs}ms`);
  console.log("=".repeat(40) + "\n");
}
