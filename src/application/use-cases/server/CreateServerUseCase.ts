import { IServerRepository } from "@/src/domain/repositories/IServerRepository";
import { IMemberRepository } from "@/src/domain/repositories/IMemberRepository";
import { IChannelRepository } from "@/src/domain/repositories/IChannelRepository";
import { Server } from "@/src/domain/entities/Server";
import { Member } from "@/src/domain/entities/Member";
import { Channel } from "@/src/domain/entities/Channel";
import { Result } from "@/src/shared/Result";
import { CreateServerDto, ServerResponseDto } from "@/src/application/dtos";
import { ServerMapper } from "@/src/application/mappers";

export interface CreateServerInput {
  dto: CreateServerDto;
  profileId: string;
}

export interface CreateServerOutput {
  server: ServerResponseDto;
}

export class CreateServerUseCase {
  constructor(
    private readonly serverRepository: IServerRepository,
    private readonly memberRepository: IMemberRepository,
    private readonly channelRepository: IChannelRepository
  ) {}

  async execute(input: CreateServerInput): Promise<Result<CreateServerOutput>> {
    // 1. Create the server domain entity
    const serverResult = Server.create({
      name: input.dto.name,
      imageUrl: input.dto.imageUrl,
      profileId: input.profileId,
    });

    if (!Result.isOk(serverResult)) {
      return Result.fail(serverResult.error, 400);
    }

    const server = serverResult.value;

    // 2. Save the server
    const savedServerResult = await this.serverRepository.create(server);
    if (!Result.isOk(savedServerResult)) {
      return Result.fail(savedServerResult.error, 500);
    }

    // 3. Create admin member for the creator
    const memberResult = Member.createAdmin(input.profileId, server.id);
    if (!Result.isOk(memberResult)) {
      // Rollback server creation
      await this.serverRepository.delete(server.id);
      return Result.fail(memberResult.error, 500);
    }

    const savedMemberResult = await this.memberRepository.create(memberResult.value);
    if (!Result.isOk(savedMemberResult)) {
      await this.serverRepository.delete(server.id);
      return Result.fail(savedMemberResult.error, 500);
    }

    // 4. Create default general channel
    const channelResult = Channel.createGeneral(input.profileId, server.id);
    if (!Result.isOk(channelResult)) {
      await this.memberRepository.delete(memberResult.value.id);
      await this.serverRepository.delete(server.id);
      return Result.fail(channelResult.error, 500);
    }

    const savedChannelResult = await this.channelRepository.create(channelResult.value);
    if (!Result.isOk(savedChannelResult)) {
      await this.memberRepository.delete(memberResult.value.id);
      await this.serverRepository.delete(server.id);
      return Result.fail(savedChannelResult.error, 500);
    }

    return Result.ok({
      server: ServerMapper.toDto(savedServerResult.value),
    });
  }
}
