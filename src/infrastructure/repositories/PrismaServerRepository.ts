import { PrismaClient, Server as PrismaServer } from "@prisma/client";
import { Server } from "@/src/domain/entities/Server";
import { IServerRepository, ServerWithRelations } from "@/src/domain/repositories/IServerRepository";
import { InviteCode } from "@/src/domain/value-objects/InviteCode";
import { Result } from "@/src/shared/Result";
import { PrismaMemberMapper } from "@/src/infrastructure/repositories/PrismaMemberRepository";
import { PrismaChannelMapper } from "@/src/infrastructure/repositories/PrismaChannelRepository";

export class PrismaServerMapper {
  static toDomain(prismaServer: PrismaServer): Server {
    return Server.reconstitute(
      prismaServer.id,
      {
        name: prismaServer.name,
        imageUrl: prismaServer.imageUrl,
        inviteCode: InviteCode.reconstitute(prismaServer.inviteCode),
        profileId: prismaServer.profileId,
      },
      prismaServer.createdAt,
      prismaServer.updatedAt
    );
  }

  static toPersistence(server: Server): Omit<PrismaServer, "createdAt" | "updatedAt"> {
    return {
      id: server.id,
      name: server.name,
      imageUrl: server.imageUrl,
      inviteCode: server.inviteCode.value,
      profileId: server.profileId,
    };
  }
}

export class PrismaServerRepository implements IServerRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<Server | null> {
    const server = await this.prisma.server.findUnique({
      where: { id },
    });

    return server ? PrismaServerMapper.toDomain(server) : null;
  }

  async findByIdWithRelations(id: string): Promise<ServerWithRelations | null> {
    const server = await this.prisma.server.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            profile: true,
          },
          orderBy: {
            role: "asc",
          },
        },
        channels: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    if (!server) return null;

    return {
      server: PrismaServerMapper.toDomain(server),
      members: server.members.map((m) => PrismaMemberMapper.toDomain(m)),
      channels: server.channels.map((c) => PrismaChannelMapper.toDomain(c)),
    };
  }

  async findByInviteCode(inviteCode: string): Promise<ServerWithRelations | null> {
    const server = await this.prisma.server.findUnique({
      where: { inviteCode },
      include: {
        members: {
          include: {
            profile: true,
          },
        },
        channels: true,
      },
    });

    if (!server) return null;

    return {
      server: PrismaServerMapper.toDomain(server),
      members: server.members.map((m) => PrismaMemberMapper.toDomain(m)),
      channels: server.channels.map((c) => PrismaChannelMapper.toDomain(c)),
    };
  }

  async findByProfileId(profileId: string): Promise<Server[]> {
    const servers = await this.prisma.server.findMany({
      where: {
        members: {
          some: {
            profileId,
          },
        },
      },
    });

    return servers.map((s) => PrismaServerMapper.toDomain(s));
  }

  async findFirstByProfileId(profileId: string): Promise<Server | null> {
    const server = await this.prisma.server.findFirst({
      where: {
        members: {
          some: {
            profileId,
          },
        },
      },
    });

    return server ? PrismaServerMapper.toDomain(server) : null;
  }

  async create(server: Server): Promise<Result<Server>> {
    try {
      const data = PrismaServerMapper.toPersistence(server);
      const created = await this.prisma.server.create({
        data,
      });

      return Result.ok(PrismaServerMapper.toDomain(created));
    } catch (error) {
      return Result.fail(`Failed to create server: ${error}`);
    }
  }

  async update(server: Server): Promise<Result<Server>> {
    try {
      const data = PrismaServerMapper.toPersistence(server);
      const updated = await this.prisma.server.update({
        where: { id: server.id },
        data: {
          name: data.name,
          imageUrl: data.imageUrl,
          inviteCode: data.inviteCode,
        },
      });

      return Result.ok(PrismaServerMapper.toDomain(updated));
    } catch (error) {
      return Result.fail(`Failed to update server: ${error}`);
    }
  }

  async delete(id: string): Promise<Result<void>> {
    try {
      await this.prisma.server.delete({
        where: { id },
      });

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(`Failed to delete server: ${error}`);
    }
  }
}
