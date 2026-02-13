import { IMessageRepository } from "@/src/domain/repositories/IMessageRepository";
import { IMemberRepository } from "@/src/domain/repositories/IMemberRepository";
import { IChannelRepository } from "@/src/domain/repositories/IChannelRepository";
import { Result } from "@/src/shared/Result";
import { PaginatedMessagesDto } from "@/src/application/dtos";
import { MessageMapper } from "@/src/application/mappers";

export interface GetMessagesInput {
  channelId: string;
  profileId: string;
  cursor?: string;
}

export class GetMessagesUseCase {
  constructor(
    private readonly messageRepository: IMessageRepository,
    private readonly memberRepository: IMemberRepository,
    private readonly channelRepository: IChannelRepository
  ) {}

  async execute(input: GetMessagesInput): Promise<Result<PaginatedMessagesDto>> {
    // 1. Get channel to find serverId
    const channel = await this.channelRepository.findById(input.channelId);
    
    if (!channel) {
      return Result.fail("Channel not found", 404);
    }

    // 2. Verify user is a member of this server
    const member = await this.memberRepository.findByProfileAndServer(
      input.profileId,
      channel.serverId
    );

    if (!member) {
      return Result.fail("You are not a member of this server", 403);
    }

    // 2. Get paginated messages
    const paginatedMessages = await this.messageRepository.findByChannelId(
      input.channelId,
      input.cursor
    );

    // 3. Map to DTOs
    return Result.ok({
      items: paginatedMessages.messages.map((m) =>
        MessageMapper.toDto(m.message, m.member, m.profile)
      ),
      nextCursor: paginatedMessages.nextCursor,
    });
  }
}
