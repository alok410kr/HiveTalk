import { PrismaClient, Conversation as PrismaConversation } from "@prisma/client";
import { Conversation } from "@/src/domain/entities/Conversation";
import { IConversationRepository, ConversationWithMembers } from "@/src/domain/repositories/IConversationRepository";
import { Result } from "@/src/shared/Result";
import { PrismaMemberMapper } from "@/src/infrastructure/repositories/PrismaMemberRepository";
import { PrismaProfileMapper } from "@/src/infrastructure/repositories/PrismaProfileRepository";

export class PrismaConversationMapper {
  static toDomain(prismaConversation: PrismaConversation): Conversation {
    return Conversation.reconstitute(
      prismaConversation.id,
      {
        memberOneId: prismaConversation.memberOneId,
        memberTwoId: prismaConversation.memberTwoId,
      },
      new Date(), // Conversations don't have createdAt in schema
      new Date()
    );
  }

  static toPersistence(conversation: Conversation): Omit<PrismaConversation, "id"> & { id: string } {
    return {
      id: conversation.id,
      memberOneId: conversation.memberOneId,
      memberTwoId: conversation.memberTwoId,
    };
  }
}

export class PrismaConversationRepository implements IConversationRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<Conversation | null> {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id },
    });

    return conversation ? PrismaConversationMapper.toDomain(conversation) : null;
  }

  async findByIdWithMembers(id: string): Promise<ConversationWithMembers | null> {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id },
      include: {
        memberOne: {
          include: {
            profile: true,
          },
        },
        memberTwo: {
          include: {
            profile: true,
          },
        },
      },
    });

    if (!conversation) return null;

    return {
      conversation: PrismaConversationMapper.toDomain(conversation),
      memberOne: PrismaMemberMapper.toDomain(conversation.memberOne),
      memberTwo: PrismaMemberMapper.toDomain(conversation.memberTwo),
      profileOne: PrismaProfileMapper.toDomain(conversation.memberOne.profile),
      profileTwo: PrismaProfileMapper.toDomain(conversation.memberTwo.profile),
    };
  }

  async findByMemberIds(memberOneId: string, memberTwoId: string): Promise<Conversation | null> {
    const conversation = await this.prisma.conversation.findFirst({
      where: {
        OR: [
          { memberOneId, memberTwoId },
          { memberOneId: memberTwoId, memberTwoId: memberOneId },
        ],
      },
    });

    return conversation ? PrismaConversationMapper.toDomain(conversation) : null;
  }

  async findOrCreate(memberOneId: string, memberTwoId: string): Promise<Result<Conversation>> {
    try {
      // Try to find existing conversation
      let conversation = await this.prisma.conversation.findFirst({
        where: {
          OR: [
            { memberOneId, memberTwoId },
            { memberOneId: memberTwoId, memberTwoId: memberOneId },
          ],
        },
      });

      // If not found, create new one
      if (!conversation) {
        conversation = await this.prisma.conversation.create({
          data: {
            memberOneId,
            memberTwoId,
          },
        });
      }

      return Result.ok(PrismaConversationMapper.toDomain(conversation));
    } catch (error) {
      return Result.fail(`Failed to find or create conversation: ${error}`);
    }
  }

  async create(conversation: Conversation): Promise<Result<Conversation>> {
    try {
      const data = PrismaConversationMapper.toPersistence(conversation);
      const created = await this.prisma.conversation.create({
        data,
      });

      return Result.ok(PrismaConversationMapper.toDomain(created));
    } catch (error) {
      return Result.fail(`Failed to create conversation: ${error}`);
    }
  }

  async delete(id: string): Promise<Result<void>> {
    try {
      await this.prisma.conversation.delete({
        where: { id },
      });

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(`Failed to delete conversation: ${error}`);
    }
  }
}
