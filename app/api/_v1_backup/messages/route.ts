import { NextResponse } from "next/server";
import { Message } from "@prisma/client";

import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { cache, CACHE_KEYS, CACHE_TTL, isRedisConfigured } from "@/lib/redis";
import { metrics } from "@/lib/metrics";

const MESSAGES_BATCH = 10;

export async function GET(req: Request) {
  try {
    const profile = await currentProfile();
    const { searchParams } = new URL(req.url);

    const cursor = searchParams.get("cursor");
    const channelId = searchParams.get("channelId");

    if (!profile) return new NextResponse("Unauthorized", { status: 401 });

    if (!channelId)
      return new NextResponse("Channel ID Missing", { status: 400 });

    let messages: Message[] = [];
    let fromCache = false;
    const startTime = performance.now();

    // Only cache first page (no cursor) - most frequently accessed
    const shouldUseCache = !cursor && isRedisConfigured();
    const cacheKey = `${CACHE_KEYS.MESSAGES}${channelId}:first`;

    if (shouldUseCache) {
      const { data, fromCache: cached, latencyMs } = await cache.getOrSet(
        cacheKey,
        async () => {
          return await db.message.findMany({
            take: MESSAGES_BATCH,
            where: { channelId },
            include: {
              member: {
                include: {
                  profile: true
                }
              }
            },
            orderBy: { createdAt: "desc" }
          });
        },
        CACHE_TTL.MESSAGES
      );
      messages = data || [];
      fromCache = cached;
      metrics.record("messages:getFirstPage", latencyMs, fromCache);
    } else if (cursor) {
      // Paginated query - no caching for cursor pages
      messages = await db.message.findMany({
        take: MESSAGES_BATCH,
        skip: 1,
        cursor: {
          id: cursor
        },
        where: {
          channelId
        },
        include: {
          member: {
            include: {
              profile: true
            }
          }
        },
        orderBy: { createdAt: "desc" }
      });
      metrics.record("messages:getCursorPage", performance.now() - startTime, false);
    } else {
      // No Redis configured - direct DB query
      messages = await db.message.findMany({
        take: MESSAGES_BATCH,
        where: { channelId },
        include: {
          member: {
            include: {
              profile: true
            }
          }
        },
        orderBy: { createdAt: "desc" }
      });
      metrics.record("messages:getFirstPage", performance.now() - startTime, false);
    }

    let nextCursor = null;

    if (messages.length === MESSAGES_BATCH) {
      nextCursor = messages[MESSAGES_BATCH - 1].id;
    }

    return NextResponse.json({ items: messages, nextCursor });
  } catch (error) {
    console.error("[MESSAGES_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// Helper to invalidate messages cache when a new message is sent
async function invalidateMessagesCache(channelId: string) {
  if (isRedisConfigured()) {
    await cache.del(`${CACHE_KEYS.MESSAGES}${channelId}:first`);
  }
}