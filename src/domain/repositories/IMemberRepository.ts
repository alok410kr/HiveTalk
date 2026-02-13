import { Member } from "../entities/Member";
import { Profile } from "../entities/Profile";
import { Result } from "../../shared/Result";

export interface MemberWithProfile {
  member: Member;
  profile: Profile;
}

export interface IMemberRepository {
  findById(id: string): Promise<Member | null>;
  findByIdWithProfile(id: string): Promise<MemberWithProfile | null>;
  findByProfileAndServer(profileId: string, serverId: string): Promise<Member | null>;
  findByServerId(serverId: string): Promise<Member[]>;
  findByServerIdWithProfiles(serverId: string): Promise<MemberWithProfile[]>;
  create(member: Member): Promise<Result<Member>>;
  update(member: Member): Promise<Result<Member>>;
  delete(id: string): Promise<Result<void>>;
  countByServerId(serverId: string): Promise<number>;
}
