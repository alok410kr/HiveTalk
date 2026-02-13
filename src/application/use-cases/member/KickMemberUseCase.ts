import { IMemberRepository } from "@/src/domain/repositories/IMemberRepository";
import { Result } from "@/src/shared/Result";

export interface KickMemberInput {
  memberId: string;
  serverId: string;
  profileId: string;
}

export class KickMemberUseCase {
  constructor(private readonly memberRepository: IMemberRepository) {}

  async execute(input: KickMemberInput): Promise<Result<void>> {
    // 1. Verify the requesting user can kick members
    const requestingMember = await this.memberRepository.findByProfileAndServer(
      input.profileId,
      input.serverId
    );

    if (!requestingMember) {
      return Result.fail("You are not a member of this server", 403);
    }

    if (!requestingMember.canKickMembers()) {
      return Result.fail("You don't have permission to kick members", 403);
    }

    // 2. Get the target member
    const targetMember = await this.memberRepository.findById(input.memberId);

    if (!targetMember) {
      return Result.fail("Member not found", 404);
    }

    // 3. Cannot kick admin (server owner)
    if (targetMember.isAdmin()) {
      return Result.fail("Cannot kick the server owner", 403);
    }

    // 4. Moderators can only kick guests
    if (requestingMember.isModerator() && !targetMember.isGuest()) {
      return Result.fail("Moderators can only kick guests", 403);
    }

    // 5. Cannot kick yourself
    if (targetMember.belongsToProfile(input.profileId)) {
      return Result.fail("Cannot kick yourself", 400);
    }

    // 6. Delete the member
    const deleteResult = await this.memberRepository.delete(input.memberId);

    if (!Result.isOk(deleteResult)) {
      return Result.fail(deleteResult.error, 500);
    }

    return Result.ok(undefined);
  }
}
