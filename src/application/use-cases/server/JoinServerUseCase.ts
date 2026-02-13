import { IServerRepository } from "@/src/domain/repositories/IServerRepository";
import { IMemberRepository } from "@/src/domain/repositories/IMemberRepository";
import { Member } from "@/src/domain/entities/Member";
import { Result } from "@/src/shared/Result";
import { ServerResponseDto } from "@/src/application/dtos";
import { ServerMapper } from "@/src/application/mappers";

export interface JoinServerInput {
  inviteCode: string;
  profileId: string;
}

export class JoinServerUseCase {
  constructor(
    private readonly serverRepository: IServerRepository,
    private readonly memberRepository: IMemberRepository
  ) {}

  async execute(input: JoinServerInput): Promise<Result<ServerResponseDto>> {
    // 1. Find server by invite code
    const serverWithRelations = await this.serverRepository.findByInviteCode(input.inviteCode);

    if (!serverWithRelations) {
      return Result.fail("Invalid invite code", 404);
    }

    const { server } = serverWithRelations;

    // 2. Check if user is already a member
    const existingMember = await this.memberRepository.findByProfileAndServer(
      input.profileId,
      server.id
    );

    if (existingMember) {
      // Already a member, just return the server
      return Result.ok(ServerMapper.toDto(server));
    }

    // 3. Create new member
    const memberResult = Member.create({
      profileId: input.profileId,
      serverId: server.id,
    });

    if (!Result.isOk(memberResult)) {
      return Result.fail(memberResult.error, 500);
    }

    // 4. Save the member
    const savedMemberResult = await this.memberRepository.create(memberResult.value);

    if (!Result.isOk(savedMemberResult)) {
      return Result.fail(savedMemberResult.error, 500);
    }

    return Result.ok(ServerMapper.toDto(server));
  }
}
