import { NextResponse } from "next/server";
import { currentProfile } from "@/lib/current-profile";
import { getUseCases } from "@/src/infrastructure/container";
import { Result } from "@/src/shared/Result";

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

export async function GET(req: Request) {
  try {
    const profile = await currentProfile();
    const { searchParams } = new URL(req.url);

    const cursor = searchParams.get("cursor");
    const conversationId = searchParams.get("conversationId");

    if (!profile) {
      return errorResponse("Unauthorized", 401);
    }

    if (!conversationId) {
      return errorResponse("Conversation ID Missing", 400);
    }

    const { getDirectMessages } = getUseCases();

    const result = await getDirectMessages.execute({
      conversationId,
      profileId: profile.id,
      cursor: cursor || undefined,
    });

    if (Result.isOk(result)) {
      return NextResponse.json(result.value);
    }

    return errorResponse(result.error, result.statusCode ?? 400);
  } catch (error) {
    console.error("[DIRECT_MESSAGES_GET]", error);
    return errorResponse("Internal Error", 500);
  }
}
