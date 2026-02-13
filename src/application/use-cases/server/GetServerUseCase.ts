import { IServerRepository } from "@/src/domain/repositories/IServerRepository";
import { IMemberRepository } from "@/src/domain/repositories/IMemberRepository";
import { IChannelRepository } from "@/src/domain/repositories/IChannelRepository";
import { Result } from "@/src/shared/Result";
import { ServerWithMembersDto } from "@/src/application/dtos";
import { ServerMapper } from "@/src/application/mappers";

export interface GetServerInput {
  serverId: string;
  profileId: string;
}

export class GetServerUseCase {
  constructor(
    private readonly serverRepository: IServerRepository,
    private readonly memberRepository: IMemberRepository,
    private readonly channelRepository: IChannelRepository
  ) {}

  async execute(input: GetServerInput): Promise<Result<ServerWithMembersDto>> {
    // 1. Verify user is a member of this server
    const member = await this.memberRepository.findByProfileAndServer(
      input.profileId,
      input.serverId
    );

    if (!member) {
      return Result.fail("You are not a member of this server", 403);
    }

    // 2. Get server with relations
    const serverWithRelations = await this.serverRepository.findByIdWithRelations(input.serverId);

    if (!serverWithRelations) {
      return Result.fail("Server not found", 404);
    }

    const { server, members, channels } = serverWithRelations;

    // 3. Get members with profiles
    const membersWithProfiles = await this.memberRepository.findByServerIdWithProfiles(input.serverId);

    // 4. Return detailed DTO
    return Result.ok(
      ServerMapper.toDetailedDto(
        server,
        membersWithProfiles,
        channels ?? []
      )
    );
  }
}
