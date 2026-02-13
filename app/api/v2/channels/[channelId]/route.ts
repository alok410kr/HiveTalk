/**
 * Channel Detail API Routes - Clean Architecture Implementation
 */

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getUseCases, getRepositories } from "@/src/infrastructure/container";
import { Result } from "@/src/shared/Result";
import { UpdateChannelDto } from "@/src/application/dtos";

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

// PATCH /api/v2/channels/[channelId] - Update channel
export async function PATCH(
  req: Request,
  { params }: { params: { channelId: string } }
) {
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

    const body = await req.json() as UpdateChannelDto;

    const useCases = getUseCases();
    const result = await useCases.updateChannel.execute({
      channelId: params.channelId,
      serverId,
      profileId,
      dto: body,
    });

    if (Result.isOk(result)) {
      return NextResponse.json(result.value);
    }

    return errorResponse(result.error, result.statusCode ?? 400);
  } catch (error) {
    console.error("[CHANNEL_PATCH]", error);
    return errorResponse("Internal Error", 500);
  }
}

// DELETE /api/v2/channels/[channelId] - Delete channel
export async function DELETE(
  req: Request,
  { params }: { params: { channelId: string } }
) {
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

    const useCases = getUseCases();
    const result = await useCases.deleteChannel.execute({
      channelId: params.channelId,
      serverId,
      profileId,
    });

    if (Result.isOk(result)) {
      return new NextResponse(null, { status: 204 });
    }

    return errorResponse(result.error, result.statusCode ?? 400);
  } catch (error) {
    console.error("[CHANNEL_DELETE]", error);
    return errorResponse("Internal Error", 500);
  }
}
