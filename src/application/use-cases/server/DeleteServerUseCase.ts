import { IServerRepository } from "@/src/domain/repositories/IServerRepository";
import { IMemberRepository } from "@/src/domain/repositories/IMemberRepository";
import { Result } from "@/src/shared/Result";

export interface DeleteServerInput {
  serverId: string;
  profileId: string;
}

export class DeleteServerUseCase {
  constructor(
    private readonly serverRepository: IServerRepository,
    private readonly memberRepository: IMemberRepository
  ) {}

  async execute(input: DeleteServerInput): Promise<Result<void>> {
    // 1. Get the server
    const server = await this.serverRepository.findById(input.serverId);

    if (!server) {
      return Result.fail("Server not found", 404);
    }

    // 2. Only the owner can delete the server
    if (!server.isOwnedBy(input.profileId)) {
      return Result.fail("Only the server owner can delete this server", 403);
    }

    // 3. Delete the server (cascading deletes will handle members, channels, messages)
    const deleteResult = await this.serverRepository.delete(input.serverId);

    if (!Result.isOk(deleteResult)) {
      return Result.fail(deleteResult.error, 500);
    }

    return Result.ok(undefined);
  }
}
