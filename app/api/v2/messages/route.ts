/**
 * Messages API Routes - Clean Architecture Implementation
 */

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getUseCases, getRepositories } from "@/src/infrastructure/container";
import { Result } from "@/src/shared/Result";
import { CreateMessageDto } from "@/src/application/dtos";

// Helper to get current profile ID
async function getCurrentProfileId(): Promise<string | null> {
  const { userId } = auth();
  if (!userId) return null;

  const repos = getRepositories();
  const profile = await repos.profile.findByUserId(userId);
  return profile?.id ?? null;
}

// Helper to create error response
function errorResponse(message: string, status: number) {
  return new NextResponse(
    JSON.stringify({ error: message }),
    {
      status,
      headers: { "Content-Type": "application/json" },
    }
  );
}

// GET /api/v2/messages - Get messages for a channel
export async function GET(req: Request) {
  try {
    const profileId = await getCurrentProfileId();
    if (!profileId) {
      return errorResponse("Unauthorized", 401);
    }

    const { searchParams } = new URL(req.url);
    const channelId = searchParams.get("channelId");
    const cursor = searchParams.get("cursor") ?? undefined;

    if (!channelId) {
      return errorResponse("Channel ID is required", 400);
    }

    const useCases = getUseCases();
    const result = await useCases.getMessages.execute({
      channelId,
      profileId,
      cursor,
    });

    if (Result.isOk(result)) {
      return NextResponse.json(result.value);
    }

    return errorResponse(result.error, result.statusCode ?? 400);
  } catch (error) {
    console.error("[MESSAGES_GET]", error);
    return errorResponse("Internal Error", 500);
  }
}

// POST /api/v2/messages - Send a message
export async function POST(req: Request) {
  try {
    const profileId = await getCurrentProfileId();
    if (!profileId) {
      return errorResponse("Unauthorized", 401);
    }

    const { searchParams } = new URL(req.url);
    const serverId = searchParams.get("serverId");

    if (!serverId) {
      return errorResponse("Server ID is required", 400);
    }

    const body = await req.json() as CreateMessageDto;

    const useCases = getUseCases();
    const result = await useCases.sendMessage.execute({
      dto: body,
      profileId,
      serverId,
    });

    if (Result.isOk(result)) {
      return NextResponse.json(result.value, { status: 201 });
    }

    return errorResponse(result.error, result.statusCode ?? 400);
  } catch (error) {
    console.error("[MESSAGES_POST]", error);
    return errorResponse("Internal Error", 500);
  }
}
