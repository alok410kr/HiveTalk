import { IMessageRepository } from "@/src/domain/repositories/IMessageRepository";
import { IMemberRepository } from "@/src/domain/repositories/IMemberRepository";
import { IChannelRepository } from "@/src/domain/repositories/IChannelRepository";
import { Message } from "@/src/domain/entities/Message";
import { Result } from "@/src/shared/Result";
import { CreateMessageDto, MessageResponseDto } from "@/src/application/dtos";
import { MessageMapper } from "@/src/application/mappers";

export interface SendMessageInput {
  dto: CreateMessageDto;
  profileId: string;
  serverId: string;
}

export class SendMessageUseCase {
  constructor(
    private readonly messageRepository: IMessageRepository,
    private readonly memberRepository: IMemberRepository,
    private readonly channelRepository: IChannelRepository
  ) {}

  async execute(input: SendMessageInput): Promise<Result<MessageResponseDto>> {
    // 1. Verify user is a member of this server
    const memberWithProfile = await this.memberRepository.findByProfileAndServer(
      input.profileId,
      input.serverId
    );

    if (!memberWithProfile) {
      return Result.fail("You are not a member of this server", 403);
    }

    const member = memberWithProfile;

    // 2. Verify channel exists and belongs to server
    const channel = await this.channelRepository.findById(input.dto.channelId);

    if (!channel) {
      return Result.fail("Channel not found", 404);
    }

    if (!channel.belongsToServer(input.serverId)) {
      return Result.fail("Channel does not belong to this server", 400);
    }

    // 3. Create message domain entity
    const messageResult = Message.create({
      content: input.dto.content,
      fileUrl: input.dto.fileUrl,
      memberId: member.id,
      channelId: input.dto.channelId,
    });

    if (!Result.isOk(messageResult)) {
      return Result.fail(messageResult.error, 400);
    }

    // 4. Save the message
    const savedResult = await this.messageRepository.create(messageResult.value);

    if (!Result.isOk(savedResult)) {
      return Result.fail(savedResult.error, 500);
    }

    // 5. Get the full message with member and profile
    const fullMessage = await this.memberRepository.findByIdWithProfile(member.id);

    return Result.ok(
      MessageMapper.toDto(
        savedResult.value,
        fullMessage?.member,
        fullMessage?.profile
      )
    );
  }
}
