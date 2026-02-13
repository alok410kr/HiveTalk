import { IServerRepository } from "@/src/domain/repositories/IServerRepository";
import { IMemberRepository } from "@/src/domain/repositories/IMemberRepository";
import { Result } from "@/src/shared/Result";
import { InviteResponseDto } from "@/src/application/dtos";

export interface RegenerateInviteCodeInput {
  serverId: string;
  profileId: string;
}

export class RegenerateInviteCodeUseCase {
  constructor(
    private readonly serverRepository: IServerRepository,
    private readonly memberRepository: IMemberRepository
  ) {}

  async execute(input: RegenerateInviteCodeInput): Promise<Result<InviteResponseDto>> {
    // 1. Verify user is an admin of this server
    const member = await this.memberRepository.findByProfileAndServer(
      input.profileId,
      input.serverId
    );

    if (!member) {
      return Result.fail("You are not a member of this server", 403);
    }

    if (!member.isAdmin()) {
      return Result.fail("Only admins can regenerate the invite code", 403);
    }

    // 2. Get the server
    const server = await this.serverRepository.findById(input.serverId);

    if (!server) {
      return Result.fail("Server not found", 404);
    }

    // 3. Regenerate invite code
    const regenerateResult = server.regenerateInviteCode();

    if (!Result.isOk(regenerateResult)) {
      return Result.fail(regenerateResult.error, 500);
    }

    // 4. Save the server
    const savedResult = await this.serverRepository.update(server);

    if (!Result.isOk(savedResult)) {
      return Result.fail(savedResult.error, 500);
    }

    return Result.ok({
      inviteCode: savedResult.value.inviteCode.value,
      serverName: savedResult.value.name,
      serverImageUrl: savedResult.value.imageUrl,
    });
  }
}
