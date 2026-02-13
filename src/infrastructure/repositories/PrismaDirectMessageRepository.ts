import { PrismaClient, DirectMessage as PrismaDirectMessage } from "@prisma/client";
import { DirectMessage } from "@/src/domain/entities/DirectMessage";
import { IDirectMessageRepository, DirectMessageWithMember, PaginatedDirectMessages } from "@/src/domain/repositories/IDirectMessageRepository";
import { Result } from "@/src/shared/Result";
import { PrismaMemberMapper } from "@/src/infrastructure/repositories/PrismaMemberRepository";
import { PrismaProfileMapper } from "@/src/infrastructure/repositories/PrismaProfileRepository";

const MESSAGE_BATCH_SIZE = 10;

export class PrismaDirectMessageMapper {
  static toDomain(prismaMessage: PrismaDirectMessage): DirectMessage {
    return DirectMessage.reconstitute(
      prismaMessage.id,
      {
        content: prismaMessage.content,
        fileUrl: prismaMessage.fileUrl,
        memberId: prismaMessage.memberId,
        conversationId: prismaMessage.conversationId,
        deleted: prismaMessage.deleted,
      },
      prismaMessage.createdAt,
      prismaMessage.updatedAt
    );
  }

  static toPersistence(message: DirectMessage): Omit<PrismaDirectMessage, "createdAt" | "updatedAt"> {
    return {
      id: message.id,
      content: message.content,
      fileUrl: message.fileUrl,
      memberId: message.memberId,
      conversationId: message.conversationId,
      deleted: message.deleted,
    };
  }
}

export class PrismaDirectMessageRepository implements IDirectMessageRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<DirectMessage | null> {
    const message = await this.prisma.directMessage.findUnique({
      where: { id },
    });

    return message ? PrismaDirectMessageMapper.toDomain(message) : null;
  }

  async findByIdWithMember(id: string): Promise<DirectMessageWithMember | null> {
    const message = await this.prisma.directMessage.findUnique({
      where: { id },
      include: {
        member: {
          include: {
            profile: true,
          },
        },
      },
    });

    if (!message) return null;

    return {
      directMessage: PrismaDirectMessageMapper.toDomain(message),
      member: PrismaMemberMapper.toDomain(message.member),
      profile: PrismaProfileMapper.toDomain(message.member.profile),
    };
  }

  async findByConversationId(
    conversationId: string,
    cursor?: string,
    limit: number = MESSAGE_BATCH_SIZE
  ): Promise<PaginatedDirectMessages> {
    const messages = await this.prisma.directMessage.findMany({
      where: { conversationId },
      take: limit,
      ...(cursor && {
        skip: 1,
        cursor: { id: cursor },
      }),
      include: {
        member: {
          include: {
            profile: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    let nextCursor: string | undefined = undefined;
    if (messages.length === limit) {
      nextCursor = messages[limit - 1].id;
    }

    return {
      messages: messages.map((m) => ({
        directMessage: PrismaDirectMessageMapper.toDomain(m),
        member: PrismaMemberMapper.toDomain(m.member),
        profile: PrismaProfileMapper.toDomain(m.member.profile),
      })),
      nextCursor,
    };
  }

  async create(directMessage: DirectMessage): Promise<Result<DirectMessage>> {
    try {
      const data = PrismaDirectMessageMapper.toPersistence(directMessage);
      const created = await this.prisma.directMessage.create({
        data,
      });

      return Result.ok(PrismaDirectMessageMapper.toDomain(created));
    } catch (error) {
      return Result.fail(`Failed to create direct message: ${error}`);
    }
  }

  async update(directMessage: DirectMessage): Promise<Result<DirectMessage>> {
    try {
      const data = PrismaDirectMessageMapper.toPersistence(directMessage);
      const updated = await this.prisma.directMessage.update({
        where: { id: directMessage.id },
        data: {
          content: data.content,
          fileUrl: data.fileUrl,
          deleted: data.deleted,
        },
      });

      return Result.ok(PrismaDirectMessageMapper.toDomain(updated));
    } catch (error) {
      return Result.fail(`Failed to update direct message: ${error}`);
    }
  }

  async delete(id: string): Promise<Result<void>> {
    try {
      await this.prisma.directMessage.delete({
        where: { id },
      });

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(`Failed to delete direct message: ${error}`);
    }
  }

  async softDelete(id: string): Promise<Result<void>> {
    try {
      await this.prisma.directMessage.update({
        where: { id },
        data: {
          deleted: true,
          content: "This message has been deleted.",
          fileUrl: null,
        },
      });

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(`Failed to soft delete direct message: ${error}`);
    }
  }
}
