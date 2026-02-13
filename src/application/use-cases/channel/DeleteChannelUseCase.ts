import { IChannelRepository } from "@/src/domain/repositories/IChannelRepository";
import { IMemberRepository } from "@/src/domain/repositories/IMemberRepository";
import { Result } from "@/src/shared/Result";

export interface DeleteChannelInput {
  channelId: string;
  serverId: string;
  profileId: string;
}

export class DeleteChannelUseCase {
  constructor(
    private readonly channelRepository: IChannelRepository,
    private readonly memberRepository: IMemberRepository
  ) {}

  async execute(input: DeleteChannelInput): Promise<Result<void>> {
    // 1. Verify user can manage channels
    const member = await this.memberRepository.findByProfileAndServer(
      input.profileId,
      input.serverId
    );

    if (!member) {
      return Result.fail("You are not a member of this server", 403);
    }

    if (!member.canManageChannels()) {
      return Result.fail("You don't have permission to delete channels", 403);
    }

    // 2. Get the channel
    const channel = await this.channelRepository.findById(input.channelId);

    if (!channel) {
      return Result.fail("Channel not found", 404);
    }

    // 3. Cannot delete general channel
    if (channel.isGeneral()) {
      return Result.fail("Cannot delete the general channel", 400);
    }

    // 4. Delete the channel
    const deleteResult = await this.channelRepository.delete(input.channelId);

    if (!Result.isOk(deleteResult)) {
      return Result.fail(deleteResult.error, 500);
    }

    return Result.ok(undefined);
  }
}
