import { Redis } from "@upstash/redis";

// Singleton pattern for Redis client
const globalForRedis = global as unknown as { redis?: Redis };

// Create Redis client - uses Upstash REST API (works in serverless)
export const redis = globalForRedis.redis || new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
});

if (process.env.NODE_ENV !== "production") {
  globalForRedis.redis = redis;
}

// Cache key prefixes for organization
export const CACHE_KEYS = {
  PROFILE: "profile:",
  SERVER: "server:",
  MEMBER: "member:",
  CHANNEL: "channel:",
  MESSAGES: "messages:",
  CONVERSATION: "conversation:",
  DIRECT_MESSAGES: "dm:",
} as const;

// Default TTL values (in seconds)
export const CACHE_TTL = {
  PROFILE: 300,        // 5 minutes - profiles don't change often
  SERVER: 180,         // 3 minutes
  MEMBER: 180,         // 3 minutes
  CHANNEL: 120,        // 2 minutes
  MESSAGES: 30,        // 30 seconds - messages change frequently
  CONVERSATION: 300,   // 5 minutes
} as const;

// Type-safe cache utilities
export const cache = {
  /**
   * Get a cached value
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const cached = await redis.get(key);
      return cached as T | null;
    } catch (error) {
      console.error("[REDIS_GET_ERROR]", error);
      return null;
    }
  },

  /**
   * Set a cache value with TTL
   */
  async set<T>(key: string, value: T, ttlSeconds: number): Promise<boolean> {
    try {
      await redis.set(key, JSON.stringify(value), { ex: ttlSeconds });
      return true;
    } catch (error) {
      console.error("[REDIS_SET_ERROR]", error);
      return false;
    }
  },

  /**
   * Delete a cached value
   */
  async del(key: string): Promise<boolean> {
    try {
      await redis.del(key);
      return true;
    } catch (error) {
      console.error("[REDIS_DEL_ERROR]", error);
      return false;
    }
  },

  /**
   * Delete multiple keys matching a pattern (use carefully)
   */
  async delPattern(pattern: string): Promise<boolean> {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
      return true;
    } catch (error) {
      console.error("[REDIS_DEL_PATTERN_ERROR]", error);
      return false;
    }
  },

  /**
   * Check if Redis is connected
   */
  async ping(): Promise<boolean> {
    try {
      const result = await redis.ping();
      return result === "PONG";
    } catch (error) {
      console.error("[REDIS_PING_ERROR]", error);
      return false;
    }
  },

  /**
   * Get or set - fetch from cache, or execute fn and cache result
   */
  async getOrSet<T>(
    key: string,
    fn: () => Promise<T>,
    ttlSeconds: number
  ): Promise<{ data: T; fromCache: boolean; latencyMs: number }> {
    const startTime = performance.now();
    
    // Try cache first
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return {
        data: cached,
        fromCache: true,
        latencyMs: performance.now() - startTime,
      };
    }

    // Execute function and cache result
    const data = await fn();
    await this.set(key, data, ttlSeconds);
    
    return {
      data,
      fromCache: false,
      latencyMs: performance.now() - startTime,
    };
  },
};

// Helper to check if Redis is configured
export const isRedisConfigured = (): boolean => {
  return !!(
    process.env.UPSTASH_REDIS_REST_URL &&
    process.env.UPSTASH_REDIS_REST_TOKEN
  );
};

console.log(`[REDIS] ${isRedisConfigured() ? "Configured" : "Not configured - caching disabled"}`);
