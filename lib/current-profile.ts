import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { cache, CACHE_KEYS, CACHE_TTL, isRedisConfigured } from "@/lib/redis";
import { metrics } from "@/lib/metrics";

export const currentProfile = async () => {
    const { userId } = auth();
    if (!userId) {
        return null;
    }

    const cacheKey = `${CACHE_KEYS.PROFILE}${userId}`;

    // If Redis is configured, try cache first
    if (isRedisConfigured()) {
        const { data, fromCache, latencyMs } = await cache.getOrSet(
            cacheKey,
            async () => {
                return await db.profile.findUnique({
                    where: { userId }
                });
            },
            CACHE_TTL.PROFILE
        );

        metrics.record("currentProfile", latencyMs, fromCache);
        return data;
    }

    // Fallback: direct DB query without caching
    const startTime = performance.now();
    const profile = await db.profile.findUnique({
        where: { userId }
    });
    metrics.record("currentProfile", performance.now() - startTime, false);
    
    return profile;
}