import { IChannelRepository } from "@/src/domain/repositories/IChannelRepository";
import { IMemberRepository } from "@/src/domain/repositories/IMemberRepository";
import { Channel } from "@/src/domain/entities/Channel";
import { ChannelType } from "@/src/domain/value-objects/ChannelType";
import { Result } from "@/src/shared/Result";
import { CreateChannelDto, ChannelResponseDto } from "@/src/application/dtos";
import { ChannelMapper } from "@/src/application/mappers";

export interface CreateChannelInput {
  dto: CreateChannelDto;
  profileId: string;
}

export class CreateChannelUseCase {
  constructor(
    private readonly channelRepository: IChannelRepository,
    private readonly memberRepository: IMemberRepository
  ) {}

  async execute(input: CreateChannelInput): Promise<Result<ChannelResponseDto>> {
    // 1. Verify user can create channels in this server
    const member = await this.memberRepository.findByProfileAndServer(
      input.profileId,
      input.dto.serverId
    );

    if (!member) {
      return Result.fail("You are not a member of this server", 403);
    }

    if (!member.canManageChannels()) {
      return Result.fail("You don't have permission to create channels", 403);
    }

    // 2. Create the channel domain entity
    const channelResult = Channel.create({
      name: input.dto.name,
      type: ChannelType.fromString(input.dto.type),
      profileId: input.profileId,
      serverId: input.dto.serverId,
    });

    if (!Result.isOk(channelResult)) {
      return Result.fail(channelResult.error, 400);
    }

    // 3. Save the channel
    const savedResult = await this.channelRepository.create(channelResult.value);

    if (!Result.isOk(savedResult)) {
      return Result.fail(savedResult.error, 500);
    }

    return Result.ok(ChannelMapper.toDto(savedResult.value));
  }
}
