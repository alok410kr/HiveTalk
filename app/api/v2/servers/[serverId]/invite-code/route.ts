/**
 * Invite Code API Route - Clean Architecture Implementation
 * 
 * Handles regenerating server invite codes
 */

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getUseCases, getRepositories } from "@/src/infrastructure/container";
import { Result } from "@/src/shared/Result";

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

// PATCH /api/v2/servers/[serverId]/invite-code - Regenerate invite code
export async function PATCH(
  req: Request,
  { params }: { params: { serverId: string } }
) {
  try {
    const profileId = await getCurrentProfileId();
    if (!profileId) {
      return errorResponse("Unauthorized", 401);
    }

    const useCases = getUseCases();
    const result = await useCases.regenerateInviteCode.execute({
      serverId: params.serverId,
      profileId,
    });

    if (Result.isOk(result)) {
      return NextResponse.json(result.value);
    }

    return errorResponse(result.error, result.statusCode ?? 400);
  } catch (error) {
    console.error("[INVITE_CODE_PATCH]", error);
    return errorResponse("Internal Error", 500);
  }
}
