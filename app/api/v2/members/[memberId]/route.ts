/**
 * Members API Routes - Clean Architecture Implementation
 */

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getUseCases, getRepositories } from "@/src/infrastructure/container";
import { Result } from "@/src/shared/Result";
import { UpdateMemberRoleDto } from "@/src/application/dtos";

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

// PATCH /api/v2/members/[memberId] - Update member role
export async function PATCH(
  req: Request,
  { params }: { params: { memberId: string } }
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

    const body = await req.json() as UpdateMemberRoleDto;

    const useCases = getUseCases();
    const result = await useCases.updateMemberRole.execute({
      memberId: params.memberId,
      serverId,
      profileId,
      dto: body,
    });

    if (Result.isOk(result)) {
      return NextResponse.json(result.value);
    }

    return errorResponse(result.error, result.statusCode ?? 400);
  } catch (error) {
    console.error("[MEMBER_PATCH]", error);
    return errorResponse("Internal Error", 500);
  }
}

// DELETE /api/v2/members/[memberId] - Kick member
export async function DELETE(
  req: Request,
  { params }: { params: { memberId: string } }
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
    const result = await useCases.kickMember.execute({
      memberId: params.memberId,
      serverId,
      profileId,
    });

    if (Result.isOk(result)) {
      return new NextResponse(null, { status: 204 });
    }

    return errorResponse(result.error, result.statusCode ?? 400);
  } catch (error) {
    console.error("[MEMBER_DELETE]", error);
    return errorResponse("Internal Error", 500);
  }
}
