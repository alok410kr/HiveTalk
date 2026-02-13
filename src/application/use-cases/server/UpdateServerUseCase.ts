import { IServerRepository } from "@/src/domain/repositories/IServerRepository";
import { IMemberRepository } from "@/src/domain/repositories/IMemberRepository";
import { Result } from "@/src/shared/Result";
import { UpdateServerDto, ServerResponseDto } from "@/src/application/dtos";
import { ServerMapper } from "@/src/application/mappers";

export interface UpdateServerInput {
  serverId: string;
  profileId: string;
  dto: UpdateServerDto;
}

export class UpdateServerUseCase {
  constructor(
    private readonly serverRepository: IServerRepository,
    private readonly memberRepository: IMemberRepository
  ) {}

  async execute(input: UpdateServerInput): Promise<Result<ServerResponseDto>> {
    // 1. Verify user is an admin of this server
    const member = await this.memberRepository.findByProfileAndServer(
      input.profileId,
      input.serverId
    );

    if (!member) {
      return Result.fail("You are not a member of this server", 403);
    }

    if (!member.isAdmin()) {
      return Result.fail("Only admins can update the server", 403);
    }

    // 2. Get the server
    const server = await this.serverRepository.findById(input.serverId);

    if (!server) {
      return Result.fail("Server not found", 404);
    }

    // 3. Update server properties
    if (input.dto.name) {
      const nameResult = server.updateName(input.dto.name);
      if (!Result.isOk(nameResult)) {
        return Result.fail(nameResult.error, 400);
      }
    }

    if (input.dto.imageUrl) {
      const imageResult = server.updateImageUrl(input.dto.imageUrl);
      if (!Result.isOk(imageResult)) {
        return Result.fail(imageResult.error, 400);
      }
    }

    // 4. Save the server
    const savedResult = await this.serverRepository.update(server);

    if (!Result.isOk(savedResult)) {
      return Result.fail(savedResult.error, 500);
    }

    return Result.ok(ServerMapper.toDto(savedResult.value));
  }
}
