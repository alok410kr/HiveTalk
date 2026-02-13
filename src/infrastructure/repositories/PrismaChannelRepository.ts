import { PrismaClient, Channel as PrismaChannel } from "@prisma/client";
import { Channel } from "@/src/domain/entities/Channel";
import { IChannelRepository } from "@/src/domain/repositories/IChannelRepository";
import { ChannelType } from "@/src/domain/value-objects/ChannelType";
import { Result } from "@/src/shared/Result";

export class PrismaChannelMapper {
  static toDomain(prismaChannel: PrismaChannel): Channel {
    return Channel.reconstitute(
      prismaChannel.id,
      {
        name: prismaChannel.name,
        type: ChannelType.fromString(prismaChannel.type),
        profileId: prismaChannel.profileId,
        serverId: prismaChannel.serverId,
      },
      prismaChannel.createdAt,
      prismaChannel.updatedAt
    );
  }

  static toPersistence(channel: Channel): Omit<PrismaChannel, "createdAt" | "updatedAt"> {
    return {
      id: channel.id,
      name: channel.name,
      type: channel.type.value as "TEXT" | "AUDIO" | "VIDEO",
      profileId: channel.profileId,
      serverId: channel.serverId,
    };
  }
}

export class PrismaChannelRepository implements IChannelRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<Channel | null> {
    const channel = await this.prisma.channel.findUnique({
      where: { id },
    });

    return channel ? PrismaChannelMapper.toDomain(channel) : null;
  }

  async findByServerId(serverId: string): Promise<Channel[]> {
    const channels = await this.prisma.channel.findMany({
      where: { serverId },
      orderBy: {
        createdAt: "asc",
      },
    });

    return channels.map((c) => PrismaChannelMapper.toDomain(c));
  }

  async findByServerIdAndType(serverId: string, type: string): Promise<Channel[]> {
    const channels = await this.prisma.channel.findMany({
      where: {
        serverId,
        type: type as "TEXT" | "AUDIO" | "VIDEO",
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return channels.map((c) => PrismaChannelMapper.toDomain(c));
  }

  async findGeneralByServerId(serverId: string): Promise<Channel | null> {
    const channel = await this.prisma.channel.findFirst({
      where: {
        serverId,
        name: "general",
      },
    });

    return channel ? PrismaChannelMapper.toDomain(channel) : null;
  }

  async create(channel: Channel): Promise<Result<Channel>> {
    try {
      const data = PrismaChannelMapper.toPersistence(channel);
      const created = await this.prisma.channel.create({
        data,
      });

      return Result.ok(PrismaChannelMapper.toDomain(created));
    } catch (error) {
      return Result.fail(`Failed to create channel: ${error}`);
    }
  }

  async update(channel: Channel): Promise<Result<Channel>> {
    try {
      const data = PrismaChannelMapper.toPersistence(channel);
      const updated = await this.prisma.channel.update({
        where: { id: channel.id },
        data: {
          name: data.name,
          type: data.type,
        },
      });

      return Result.ok(PrismaChannelMapper.toDomain(updated));
    } catch (error) {
      return Result.fail(`Failed to update channel: ${error}`);
    }
  }

  async delete(id: string): Promise<Result<void>> {
    try {
      await this.prisma.channel.delete({
        where: { id },
      });

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(`Failed to delete channel: ${error}`);
    }
  }

  async deleteByServerId(serverId: string): Promise<Result<void>> {
    try {
      await this.prisma.channel.deleteMany({
        where: { serverId },
      });

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(`Failed to delete channels: ${error}`);
    }
  }
}
