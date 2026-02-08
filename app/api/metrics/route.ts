import { NextResponse } from "next/server";
import { currentProfile } from "@/lib/current-profile";
import { metrics } from "@/lib/metrics";
import { isRedisConfigured } from "@/lib/redis";

// GET /api/metrics - Get performance metrics with comparison
export async function GET(req: Request) {
  try {
    const profile = await currentProfile();
    
    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const exported = metrics.export();

    return NextResponse.json({
      summary: exported.summary,
      baseline: exported.baseline,
      comparison: exported.comparison,
      recentMetrics: exported.recentMetrics,
      config: {
        redisConfigured: isRedisConfigured(),
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[METRICS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// POST /api/metrics - Capture baseline for comparison
export async function POST(req: Request) {
  try {
    const profile = await currentProfile();
    
    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const label = body.label || "Before Optimization";

    const baseline = metrics.captureBaseline(label);
    
    return NextResponse.json({
      success: true,
      message: "Baseline captured",
      baseline,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[METRICS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// DELETE /api/metrics - Clear all metrics
export async function DELETE(req: Request) {
  try {
    const profile = await currentProfile();
    
    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const clearBaseline = searchParams.get("baseline") === "true";

    metrics.clear();
    if (clearBaseline) {
      metrics.clearBaseline();
    }
    
    return NextResponse.json({
      success: true,
      message: clearBaseline ? "Metrics and baseline cleared" : "Metrics cleared (baseline preserved)",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[METRICS_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
