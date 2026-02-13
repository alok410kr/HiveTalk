import { IMemberRepository } from "@/src/domain/repositories/IMemberRepository";
import { MemberRole } from "@/src/domain/value-objects/MemberRole";
import { Result } from "@/src/shared/Result";
import { UpdateMemberRoleDto, MemberResponseDto } from "@/src/application/dtos";
import { MemberMapper } from "@/src/application/mappers";

export interface UpdateMemberRoleInput {
  memberId: string;
  serverId: string;
  profileId: string;
  dto: UpdateMemberRoleDto;
}

export class UpdateMemberRoleUseCase {
  constructor(private readonly memberRepository: IMemberRepository) {}

  async execute(input: UpdateMemberRoleInput): Promise<Result<MemberResponseDto>> {
    // 1. Verify the requesting user is an admin or moderator
    const requestingMember = await this.memberRepository.findByProfileAndServer(
      input.profileId,
      input.serverId
    );

    if (!requestingMember) {
      return Result.fail("You are not a member of this server", 403);
    }

    if (!requestingMember.canManageMembers()) {
      return Result.fail("You don't have permission to manage members", 403);
    }

    // 2. Get the target member
    const targetMemberWithProfile = await this.memberRepository.findByIdWithProfile(input.memberId);

    if (!targetMemberWithProfile) {
      return Result.fail("Member not found", 404);
    }

    const { member: targetMember, profile } = targetMemberWithProfile;

    // 3. Cannot change role of admin (server owner)
    if (targetMember.isAdmin()) {
      return Result.fail("Cannot change the role of the server owner", 403);
    }

    // 4. Moderators can only change guests to moderators
    if (requestingMember.isModerator()) {
      if (input.dto.role !== "MODERATOR" || !targetMember.isGuest()) {
        return Result.fail("Moderators can only promote guests to moderators", 403);
      }
    }

    // 5. Change the role
    const newRole = MemberRole.fromString(input.dto.role);
    const changeResult = targetMember.changeRole(newRole);

    if (!Result.isOk(changeResult)) {
      return Result.fail(changeResult.error, 400);
    }

    // 6. Save the member
    const savedResult = await this.memberRepository.update(targetMember);

    if (!Result.isOk(savedResult)) {
      return Result.fail(savedResult.error, 500);
    }

    return Result.ok(MemberMapper.toDto(savedResult.value, profile));
  }
}
