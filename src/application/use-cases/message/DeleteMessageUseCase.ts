import { IMessageRepository } from "@/src/domain/repositories/IMessageRepository";
import { IMemberRepository } from "@/src/domain/repositories/IMemberRepository";
import { Result } from "@/src/shared/Result";
import { MessageResponseDto } from "@/src/application/dtos";
import { MessageMapper } from "@/src/application/mappers";

export interface DeleteMessageInput {
  messageId: string;
  serverId: string;
  profileId: string;
}

export class DeleteMessageUseCase {
  constructor(
    private readonly messageRepository: IMessageRepository,
    private readonly memberRepository: IMemberRepository
  ) {}

  async execute(input: DeleteMessageInput): Promise<Result<MessageResponseDto>> {
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

    // 3. Determine if user can delete (owner or admin/moderator)
    const isOwner = message.isOwnedBy(memberWithProfile.id);
    const canDeleteOthers = memberWithProfile.canDeleteMessages();

    // 4. Soft delete the message
    const deleteResult = message.softDelete(memberWithProfile.id, canDeleteOthers);

    if (!Result.isOk(deleteResult)) {
      return Result.fail(deleteResult.error, 403);
    }

    // 5. Save the message
    const savedResult = await this.messageRepository.update(message);

    if (!Result.isOk(savedResult)) {
      return Result.fail(savedResult.error, 500);
    }

    return Result.ok(MessageMapper.toDto(savedResult.value, member, profile));
  }
}
