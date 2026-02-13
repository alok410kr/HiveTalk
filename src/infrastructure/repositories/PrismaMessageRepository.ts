import { PrismaClient, Message as PrismaMessage } from "@prisma/client";
import { Message } from "@/src/domain/entities/Message";
import { IMessageRepository, MessageWithMember, PaginatedMessages } from "@/src/domain/repositories/IMessageRepository";
import { Result } from "@/src/shared/Result";
import { PrismaMemberMapper } from "@/src/infrastructure/repositories/PrismaMemberRepository";
import { PrismaProfileMapper } from "@/src/infrastructure/repositories/PrismaProfileRepository";

const MESSAGE_BATCH_SIZE = 10;

export class PrismaMessageMapper {
  static toDomain(prismaMessage: PrismaMessage): Message {
    return Message.reconstitute(
      prismaMessage.id,
      {
        content: prismaMessage.content,
        fileUrl: prismaMessage.fileUrl,
        memberId: prismaMessage.memberId,
        channelId: prismaMessage.channelId,
        deleted: prismaMessage.deleted,
      },
      prismaMessage.createdAt,
      prismaMessage.updatedAt
    );
  }

  static toPersistence(message: Message): Omit<PrismaMessage, "createdAt" | "updatedAt"> {
    return {
      id: message.id,
      content: message.content,
      fileUrl: message.fileUrl,
      memberId: message.memberId,
      channelId: message.channelId,
      deleted: message.deleted,
    };
  }
}

export class PrismaMessageRepository implements IMessageRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<Message | null> {
    const message = await this.prisma.message.findUnique({
      where: { id },
    });

    return message ? PrismaMessageMapper.toDomain(message) : null;
  }

  async findByIdWithMember(id: string): Promise<MessageWithMember | null> {
    const message = await this.prisma.message.findUnique({
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
      message: PrismaMessageMapper.toDomain(message),
      member: PrismaMemberMapper.toDomain(message.member),
      profile: PrismaProfileMapper.toDomain(message.member.profile),
    };
  }

  async findByChannelId(
    channelId: string,
    cursor?: string,
    limit: number = MESSAGE_BATCH_SIZE
  ): Promise<PaginatedMessages> {
    const messages = await this.prisma.message.findMany({
      where: { channelId },
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
        message: PrismaMessageMapper.toDomain(m),
        member: PrismaMemberMapper.toDomain(m.member),
        profile: PrismaProfileMapper.toDomain(m.member.profile),
      })),
      nextCursor,
    };
  }

  async create(message: Message): Promise<Result<Message>> {
    try {
      const data = PrismaMessageMapper.toPersistence(message);
      const created = await this.prisma.message.create({
        data,
      });

      return Result.ok(PrismaMessageMapper.toDomain(created));
    } catch (error) {
      return Result.fail(`Failed to create message: ${error}`);
    }
  }

  async update(message: Message): Promise<Result<Message>> {
    try {
      const data = PrismaMessageMapper.toPersistence(message);
      const updated = await this.prisma.message.update({
        where: { id: message.id },
        data: {
          content: data.content,
          fileUrl: data.fileUrl,
          deleted: data.deleted,
        },
      });

      return Result.ok(PrismaMessageMapper.toDomain(updated));
    } catch (error) {
      return Result.fail(`Failed to update message: ${error}`);
    }
  }

  async delete(id: string): Promise<Result<void>> {
    try {
      await this.prisma.message.delete({
        where: { id },
      });

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(`Failed to delete message: ${error}`);
    }
  }

  async softDelete(id: string): Promise<Result<void>> {
    try {
      await this.prisma.message.update({
        where: { id },
        data: {
          deleted: true,
          content: "This message has been deleted.",
          fileUrl: null,
        },
      });

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(`Failed to soft delete message: ${error}`);
    }
  }
}
