/**
 * Server API Routes - Clean Architecture Implementation
 * 
 * This is a thin controller that delegates to use cases.
 * It handles only:
 * - HTTP request/response
 * - Authentication
 * - Rate limiting
 * - Calling use cases
 */

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getUseCases, getRepositories } from "@/src/infrastructure/container";
import { Result } from "@/src/shared/Result";
import { CreateServerDto } from "@/src/application/dtos";
import { checkRateLimit, getRateLimitHeaders } from "@/lib/rate-limit";

// Helper to get current profile ID
async function getCurrentProfileId(): Promise<string | null> {
  const { userId } = auth();
  if (!userId) return null;

  const repos = getRepositories();
  const profile = await repos.profile.findByUserId(userId);
  return profile?.id ?? null;
}

// Helper to create error response
function errorResponse(message: string, status: number, headers?: Record<string, string>) {
  return new NextResponse(
    JSON.stringify({ error: message }),
    {
      status,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    }
  );
}

// POST /api/v2/servers - Create a new server
export async function POST(req: Request) {
  try {
    // 1. Authentication
    const profileId = await getCurrentProfileId();
    if (!profileId) {
      return errorResponse("Unauthorized", 401);
    }

    // 2. Rate limiting
    const rateLimitResult = await checkRateLimit("serverCreate", profileId);
    if (!rateLimitResult.success) {
      return errorResponse(
        "Rate limit exceeded. You can only create 5 servers per hour.",
        429,
        getRateLimitHeaders(rateLimitResult)
      );
    }

    // 3. Parse request body
    const body = await req.json() as CreateServerDto;

    // 4. Execute use case
    const useCases = getUseCases();
    const result = await useCases.createServer.execute({
      dto: body,
      profileId,
    });

    // 5. Return response
    if (Result.isOk(result)) {
      return NextResponse.json(result.value.server, { status: 201 });
    }

    return errorResponse(result.error, result.statusCode ?? 400);
  } catch (error) {
    console.error("[SERVERS_POST]", error);
    return errorResponse("Internal Error", 500);
  }
}

// GET /api/v2/servers - List user's servers
export async function GET(req: Request) {
  try {
    // 1. Authentication
    const profileId = await getCurrentProfileId();
    if (!profileId) {
      return errorResponse("Unauthorized", 401);
    }

    // 2. Get servers
    const repos = getRepositories();
    const servers = await repos.server.findByProfileId(profileId);

    // 3. Map to DTOs (simplified - could use a ListServersUseCase)
    const serverDtos = servers.map(server => ({
      id: server.id,
      name: server.name,
      imageUrl: server.imageUrl,
      inviteCode: server.inviteCode.value,
    }));

    return NextResponse.json(serverDtos);
  } catch (error) {
    console.error("[SERVERS_GET]", error);
    return errorResponse("Internal Error", 500);
  }
}
