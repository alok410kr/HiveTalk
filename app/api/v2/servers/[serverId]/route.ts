/**
 * Server Detail API Routes - Clean Architecture Implementation
 * 
 * Handles operations on a specific server: GET, PATCH, DELETE
 */

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getUseCases, getRepositories } from "@/src/infrastructure/container";
import { Result } from "@/src/shared/Result";
import { UpdateServerDto } from "@/src/application/dtos";

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

// GET /api/v2/servers/[serverId] - Get server details
export async function GET(
  req: Request,
  { params }: { params: { serverId: string } }
) {
  try {
    const profileId = await getCurrentProfileId();
    if (!profileId) {
      return errorResponse("Unauthorized", 401);
    }

    const useCases = getUseCases();
    const result = await useCases.getServer.execute({
      serverId: params.serverId,
      profileId,
    });

    if (Result.isOk(result)) {
      return NextResponse.json(result.value);
    }

    return errorResponse(result.error, result.statusCode ?? 400);
  } catch (error) {
    console.error("[SERVER_GET]", error);
    return errorResponse("Internal Error", 500);
  }
}

// PATCH /api/v2/servers/[serverId] - Update server
export async function PATCH(
  req: Request,
  { params }: { params: { serverId: string } }
) {
  try {
    const profileId = await getCurrentProfileId();
    if (!profileId) {
      return errorResponse("Unauthorized", 401);
    }

    const body = await req.json() as UpdateServerDto;

    const useCases = getUseCases();
    const result = await useCases.updateServer.execute({
      serverId: params.serverId,
      profileId,
      dto: body,
    });

    if (Result.isOk(result)) {
      return NextResponse.json(result.value);
    }

    return errorResponse(result.error, result.statusCode ?? 400);
  } catch (error) {
    console.error("[SERVER_PATCH]", error);
    return errorResponse("Internal Error", 500);
  }
}

// DELETE /api/v2/servers/[serverId] - Delete server
export async function DELETE(
  req: Request,
  { params }: { params: { serverId: string } }
) {
  try {
    const profileId = await getCurrentProfileId();
    if (!profileId) {
      return errorResponse("Unauthorized", 401);
    }

    const useCases = getUseCases();
    const result = await useCases.deleteServer.execute({
      serverId: params.serverId,
      profileId,
    });

    if (Result.isOk(result)) {
      return new NextResponse(null, { status: 204 });
    }

    return errorResponse(result.error, result.statusCode ?? 400);
  } catch (error) {
    console.error("[SERVER_DELETE]", error);
    return errorResponse("Internal Error", 500);
  }
}
