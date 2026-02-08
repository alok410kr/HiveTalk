import { Ratelimit } from "@upstash/ratelimit";
import { redis, isRedisConfigured } from "@/lib/redis";

// Rate limit configurations for different endpoints
export const rateLimiters = {
  // Messages: 30 requests per 10 seconds (posting messages)
  messages: isRedisConfigured()
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(30, "10 s"),
        prefix: "ratelimit:messages",
        analytics: true,
      })
    : null,

  // API general: 100 requests per minute
  api: isRedisConfigured()
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(100, "1 m"),
        prefix: "ratelimit:api",
        analytics: true,
      })
    : null,

  // Uploads: 10 uploads per minute
  uploads: isRedisConfigured()
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(10, "1 m"),
        prefix: "ratelimit:uploads",
        analytics: true,
      })
    : null,

  // Server creation: 5 per hour
  serverCreate: isRedisConfigured()
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(5, "1 h"),
        prefix: "ratelimit:server-create",
        analytics: true,
      })
    : null,

  // Channel creation: 20 per hour
  channelCreate: isRedisConfigured()
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(20, "1 h"),
        prefix: "ratelimit:channel-create",
        analytics: true,
      })
    : null,
};

export type RateLimitType = keyof typeof rateLimiters;

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * Check rate limit for a given identifier (usually profileId or IP)
 */
export async function checkRateLimit(
  type: RateLimitType,
  identifier: string
): Promise<RateLimitResult> {
  const limiter = rateLimiters[type];

  // If Redis not configured, allow all requests
  if (!limiter) {
    return {
      success: true,
      limit: Infinity,
      remaining: Infinity,
      reset: 0,
    };
  }

  try {
    const result = await limiter.limit(identifier);
    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
    };
  } catch (error) {
    console.error("[RATE_LIMIT_ERROR]", error);
    // On error, allow the request (fail open)
    return {
      success: true,
      limit: Infinity,
      remaining: Infinity,
      reset: 0,
    };
  }
}

/**
 * Helper to create rate limit response headers
 */
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    "X-RateLimit-Limit": String(result.limit),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(result.reset),
  };
}
