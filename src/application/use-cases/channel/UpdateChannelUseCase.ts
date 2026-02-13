import { IChannelRepository } from "@/src/domain/repositories/IChannelRepository";
import { IMemberRepository } from "@/src/domain/repositories/IMemberRepository";
import { ChannelType } from "@/src/domain/value-objects/ChannelType";
import { Result } from "@/src/shared/Result";
import { UpdateChannelDto, ChannelResponseDto } from "@/src/application/dtos";
import { ChannelMapper } from "@/src/application/mappers";

export interface UpdateChannelInput {
  channelId: string;
  serverId: string;
  profileId: string;
  dto: UpdateChannelDto;
}

export class UpdateChannelUseCase {
  constructor(
    private readonly channelRepository: IChannelRepository,
    private readonly memberRepository: IMemberRepository
  ) {}

  async execute(input: UpdateChannelInput): Promise<Result<ChannelResponseDto>> {
    // 1. Verify user can manage channels
    const member = await this.memberRepository.findByProfileAndServer(
      input.profileId,
      input.serverId
    );

    if (!member) {
      return Result.fail("You are not a member of this server", 403);
    }

    if (!member.canManageChannels()) {
      return Result.fail("You don't have permission to edit channels", 403);
    }

    // 2. Get the channel
    const channel = await this.channelRepository.findById(input.channelId);

    if (!channel) {
      return Result.fail("Channel not found", 404);
    }

    // 3. Cannot edit general channel name
    if (channel.isGeneral() && input.dto.name) {
      return Result.fail("Cannot rename the general channel", 400);
    }

    // 4. Update channel properties
    if (input.dto.name) {
      const nameResult = channel.updateName(input.dto.name);
      if (!Result.isOk(nameResult)) {
        return Result.fail(nameResult.error, 400);
      }
    }

    if (input.dto.type) {
      const typeResult = channel.changeType(ChannelType.fromString(input.dto.type));
      if (!Result.isOk(typeResult)) {
        return Result.fail(typeResult.error, 400);
      }
    }

    // 5. Save the channel
    const savedResult = await this.channelRepository.update(channel);

    if (!Result.isOk(savedResult)) {
      return Result.fail(savedResult.error, 500);
    }

    return Result.ok(ChannelMapper.toDto(savedResult.value));
  }
}
