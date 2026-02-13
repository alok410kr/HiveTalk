/**
 * Channels API Routes - Clean Architecture Implementation
 */

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getUseCases, getRepositories } from "@/src/infrastructure/container";
import { Result } from "@/src/shared/Result";
import { CreateChannelDto } from "@/src/application/dtos";

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

// POST /api/v2/channels - Create a new channel
export async function POST(req: Request) {
  try {
    const profileId = await getCurrentProfileId();
    if (!profileId) {
      return errorResponse("Unauthorized", 401);
    }

    const body = await req.json() as CreateChannelDto;

    const useCases = getUseCases();
    const result = await useCases.createChannel.execute({
      dto: body,
      profileId,
    });

    if (Result.isOk(result)) {
      return NextResponse.json(result.value, { status: 201 });
    }

    return errorResponse(result.error, result.statusCode ?? 400);
  } catch (error) {
    console.error("[CHANNELS_POST]", error);
    return errorResponse("Internal Error", 500);
  }
}
