import { IMessageRepository } from "@/src/domain/repositories/IMessageRepository";
import { IMemberRepository } from "@/src/domain/repositories/IMemberRepository";
import { Result } from "@/src/shared/Result";
import { UpdateMessageDto, MessageResponseDto } from "@/src/application/dtos";
import { MessageMapper } from "@/src/application/mappers";

export interface UpdateMessageInput {
  messageId: string;
  serverId: string;
  profileId: string;
  dto: UpdateMessageDto;
}

export class UpdateMessageUseCase {
  constructor(
    private readonly messageRepository: IMessageRepository,
    private readonly memberRepository: IMemberRepository
  ) {}

  async execute(input: UpdateMessageInput): Promise<Result<MessageResponseDto>> {
    // 1. Get the member
    const memberWithProfile = await this.memberRepository.findByProfileAndServer(
      input.profileId,
      input.serverId
    );

    if (!memberWithProfile) {
      return Result.fail("You are not a member of this server", 403);
    }

    // 2. Get the message
    const messageWithMember = await this.messageRepository.findByIdWithMember(input.messageId);

    if (!messageWithMember) {
      return Result.fail("Message not found", 404);
    }

    const { message, member, profile } = messageWithMember;

    // 3. Edit the message (only the author can edit)
    const editResult = message.editContent(input.dto.content, memberWithProfile.id);

    if (!Result.isOk(editResult)) {
      return Result.fail(editResult.error, 403);
    }

    // 4. Save the message
    const savedResult = await this.messageRepository.update(message);

    if (!Result.isOk(savedResult)) {
      return Result.fail(savedResult.error, 500);
    }

    return Result.ok(MessageMapper.toDto(savedResult.value, member, profile));
  }
}
