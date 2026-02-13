/**
 * Test endpoint for v2 architecture - NO AUTH REQUIRED
 * DELETE THIS FILE BEFORE PRODUCTION
 */

import { NextResponse } from "next/server";
import { getUseCases, getRepositories } from "@/src/infrastructure/container";
import { Result } from "@/src/shared/Result";

export async function GET() {
  try {
    // Test that the container loads correctly
    const repos = getRepositories();
    const useCases = getUseCases();

    return NextResponse.json({
      success: true,
      message: "Clean Architecture is working!",
      container: {
        repositories: Object.keys(repos),
        useCases: Object.keys(useCases),
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
