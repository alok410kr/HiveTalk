import { IServerRepository } from "@/src/domain/repositories/IServerRepository";
import { IMemberRepository } from "@/src/domain/repositories/IMemberRepository";
import { Result } from "@/src/shared/Result";

export interface LeaveServerInput {
  serverId: string;
  profileId: string;
}

export class LeaveServerUseCase {
  constructor(
    private readonly serverRepository: IServerRepository,
    private readonly memberRepository: IMemberRepository
  ) {}

  async execute(input: LeaveServerInput): Promise<Result<void>> {
    // 1. Get the server
    const server = await this.serverRepository.findById(input.serverId);

    if (!server) {
      return Result.fail("Server not found", 404);
    }

    // 2. Server owner cannot leave
    if (server.isOwnedBy(input.profileId)) {
      return Result.fail("Server owner cannot leave. Transfer ownership or delete the server.", 403);
    }

    // 3. Find the member
    const member = await this.memberRepository.findByProfileAndServer(
      input.profileId,
      input.serverId
    );

    if (!member) {
      return Result.fail("You are not a member of this server", 404);
    }

    // 4. Delete the member
    const deleteResult = await this.memberRepository.delete(member.id);

    if (!Result.isOk(deleteResult)) {
      return Result.fail(deleteResult.error, 500);
    }

    return Result.ok(undefined);
  }
}
