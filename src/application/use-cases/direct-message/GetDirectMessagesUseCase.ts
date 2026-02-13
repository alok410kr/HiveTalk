import { IDirectMessageRepository } from "@/src/domain/repositories/IDirectMessageRepository";
import { IConversationRepository } from "@/src/domain/repositories/IConversationRepository";
import { IMemberRepository } from "@/src/domain/repositories/IMemberRepository";
import { Result } from "@/src/shared/Result";
import { PaginatedDirectMessagesDto } from "@/src/application/dtos";
import { DirectMessageMapper, MemberMapper } from "@/src/application/mappers";

export interface GetDirectMessagesInput {
  conversationId: string;
  profileId: string;
  cursor?: string;
}

export class GetDirectMessagesUseCase {
  constructor(
    private readonly directMessageRepository: IDirectMessageRepository,
    private readonly conversationRepository: IConversationRepository,
    private readonly memberRepository: IMemberRepository
  ) {}

  async execute(input: GetDirectMessagesInput): Promise<Result<PaginatedDirectMessagesDto>> {
    // 1. Get conversation and verify user is part of it
    const conversation = await this.conversationRepository.findById(input.conversationId);
    
    if (!conversation) {
      return Result.fail("Conversation not found", 404);
    }

    // 2. Get both members with profiles to verify access
    const memberOne = await this.memberRepository.findByIdWithProfile(conversation.memberOneId);
    const memberTwo = await this.memberRepository.findByIdWithProfile(conversation.memberTwoId);

    if (!memberOne || !memberTwo) {
      return Result.fail("Conversation members not found", 404);
    }

    // 3. Verify the requesting user is part of this conversation
    const isParticipant = 
      memberOne.profile.id === input.profileId || 
      memberTwo.profile.id === input.profileId;

    if (!isParticipant) {
      return Result.fail("You are not part of this conversation", 403);
    }

    // 4. Get paginated direct messages
    const paginatedMessages = await this.directMessageRepository.findByConversationId(
      input.conversationId,
      input.cursor
    );

    // 5. Map to DTOs
    return Result.ok({
      items: paginatedMessages.messages.map((m) =>
        DirectMessageMapper.toDto(m.directMessage, m.member, m.profile)
      ),
      nextCursor: paginatedMessages.nextCursor,
    });
  }
}
