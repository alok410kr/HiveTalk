import { PrismaClient, Member as PrismaMember } from "@prisma/client";
import { Member } from "@/src/domain/entities/Member";
import { Profile } from "@/src/domain/entities/Profile";
import { IMemberRepository, MemberWithProfile } from "@/src/domain/repositories/IMemberRepository";
import { MemberRole } from "@/src/domain/value-objects/MemberRole";
import { Result } from "@/src/shared/Result";
import { PrismaProfileMapper } from "@/src/infrastructure/repositories/PrismaProfileRepository";

export class PrismaMemberMapper {
  static toDomain(prismaMember: PrismaMember): Member {
    return Member.reconstitute(
      prismaMember.id,
      {
        role: MemberRole.fromString(prismaMember.role),
        profileId: prismaMember.profileId,
        serverId: prismaMember.serverId,
      },
      prismaMember.createdAt,
      prismaMember.updatedAt
    );
  }

  static toPersistence(member: Member): Omit<PrismaMember, "createdAt" | "updatedAt"> {
    return {
      id: member.id,
      role: member.role.value as "ADMIN" | "MODERATOR" | "GUEST",
      profileId: member.profileId,
      serverId: member.serverId,
    };
  }
}

export class PrismaMemberRepository implements IMemberRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<Member | null> {
    const member = await this.prisma.member.findUnique({
      where: { id },
    });

    return member ? PrismaMemberMapper.toDomain(member) : null;
  }

  async findByIdWithProfile(id: string): Promise<MemberWithProfile | null> {
    const member = await this.prisma.member.findUnique({
      where: { id },
      include: {
        profile: true,
      },
    });

    if (!member) return null;

    return {
      member: PrismaMemberMapper.toDomain(member),
      profile: PrismaProfileMapper.toDomain(member.profile),
    };
  }

  async findByProfileAndServer(profileId: string, serverId: string): Promise<Member | null> {
    const member = await this.prisma.member.findFirst({
      where: {
        profileId,
        serverId,
      },
    });

    return member ? PrismaMemberMapper.toDomain(member) : null;
  }

  async findByServerId(serverId: string): Promise<Member[]> {
    const members = await this.prisma.member.findMany({
      where: { serverId },
      orderBy: {
        role: "asc",
      },
    });

    return members.map((m) => PrismaMemberMapper.toDomain(m));
  }

  async findByServerIdWithProfiles(serverId: string): Promise<MemberWithProfile[]> {
    const members = await this.prisma.member.findMany({
      where: { serverId },
      include: {
        profile: true,
      },
      orderBy: {
        role: "asc",
      },
    });

    return members.map((m) => ({
      member: PrismaMemberMapper.toDomain(m),
      profile: PrismaProfileMapper.toDomain(m.profile),
    }));
  }

  async create(member: Member): Promise<Result<Member>> {
    try {
      const data = PrismaMemberMapper.toPersistence(member);
      const created = await this.prisma.member.create({
        data,
      });

      return Result.ok(PrismaMemberMapper.toDomain(created));
    } catch (error) {
      return Result.fail(`Failed to create member: ${error}`);
    }
  }

  async update(member: Member): Promise<Result<Member>> {
    try {
      const data = PrismaMemberMapper.toPersistence(member);
      const updated = await this.prisma.member.update({
        where: { id: member.id },
        data: {
          role: data.role,
        },
      });

      return Result.ok(PrismaMemberMapper.toDomain(updated));
    } catch (error) {
      return Result.fail(`Failed to update member: ${error}`);
    }
  }

  async delete(id: string): Promise<Result<void>> {
    try {
      await this.prisma.member.delete({
        where: { id },
      });

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(`Failed to delete member: ${error}`);
    }
  }

  async countByServerId(serverId: string): Promise<number> {
    return this.prisma.member.count({
      where: { serverId },
    });
  }
}
