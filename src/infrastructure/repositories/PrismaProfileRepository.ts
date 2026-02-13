import { PrismaClient, Profile as PrismaProfile } from "@prisma/client";
import { Profile } from "@/src/domain/entities/Profile";
import { IProfileRepository } from "@/src/domain/repositories/IProfileRepository";
import { Result } from "@/src/shared/Result";

export class PrismaProfileMapper {
  static toDomain(prismaProfile: PrismaProfile): Profile {
    return Profile.reconstitute(
      prismaProfile.id,
      {
        userId: prismaProfile.userId,
        name: prismaProfile.name,
        imageUrl: prismaProfile.imageUrl,
        email: prismaProfile.email,
      },
      prismaProfile.createdAt,
      prismaProfile.updatedAt
    );
  }

  static toPersistence(profile: Profile): Omit<PrismaProfile, "createdAt" | "updatedAt"> {
    return {
      id: profile.id,
      userId: profile.userId,
      name: profile.name,
      imageUrl: profile.imageUrl,
      email: profile.email,
    };
  }
}

export class PrismaProfileRepository implements IProfileRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<Profile | null> {
    const profile = await this.prisma.profile.findUnique({
      where: { id },
    });

    return profile ? PrismaProfileMapper.toDomain(profile) : null;
  }

  async findByUserId(userId: string): Promise<Profile | null> {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
    });

    return profile ? PrismaProfileMapper.toDomain(profile) : null;
  }

  async findByEmail(email: string): Promise<Profile | null> {
    const profile = await this.prisma.profile.findFirst({
      where: { email },
    });

    return profile ? PrismaProfileMapper.toDomain(profile) : null;
  }

  async create(profile: Profile): Promise<Result<Profile>> {
    try {
      const data = PrismaProfileMapper.toPersistence(profile);
      const created = await this.prisma.profile.create({
        data,
      });

      return Result.ok(PrismaProfileMapper.toDomain(created));
    } catch (error) {
      return Result.fail(`Failed to create profile: ${error}`);
    }
  }

  async update(profile: Profile): Promise<Result<Profile>> {
    try {
      const data = PrismaProfileMapper.toPersistence(profile);
      const updated = await this.prisma.profile.update({
        where: { id: profile.id },
        data: {
          name: data.name,
          imageUrl: data.imageUrl,
          email: data.email,
        },
      });

      return Result.ok(PrismaProfileMapper.toDomain(updated));
    } catch (error) {
      return Result.fail(`Failed to update profile: ${error}`);
    }
  }

  async delete(id: string): Promise<Result<void>> {
    try {
      await this.prisma.profile.delete({
        where: { id },
      });

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(`Failed to delete profile: ${error}`);
    }
  }
}
