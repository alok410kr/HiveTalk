import { Entity } from "../core/Entity";
import { Result } from "../../shared/Result";
import { MemberRole, MemberRoleType } from "../value-objects/MemberRole";

export interface MemberProps {
  role: MemberRole;
  profileId: string;
  serverId: string;
}

export class Member extends Entity<string> {
  private _role: MemberRole;
  private _profileId: string;
  private _serverId: string;

  private constructor(
    id: string,
    props: MemberProps,
    createdAt?: Date,
    updatedAt?: Date
  ) {
    super(id, createdAt, updatedAt);
    this._role = props.role;
    this._profileId = props.profileId;
    this._serverId = props.serverId;
  }

  // Getters
  get role(): MemberRole {
    return this._role;
  }

  get profileId(): string {
    return this._profileId;
  }

  get serverId(): string {
    return this._serverId;
  }

  // Factory method for creating new members
  static create(props: { profileId: string; serverId: string; role?: MemberRole }, id?: string): Result<Member> {
    if (!props.profileId) {
      return Result.fail("Profile ID is required");
    }

    if (!props.serverId) {
      return Result.fail("Server ID is required");
    }

    const role = props.role ?? MemberRole.guest();
    const memberId = id ?? crypto.randomUUID();

    return Result.ok(new Member(memberId, {
      role,
      profileId: props.profileId,
      serverId: props.serverId,
    }));
  }

  // Create admin member (for server creator)
  static createAdmin(profileId: string, serverId: string, id?: string): Result<Member> {
    return Member.create({
      profileId,
      serverId,
      role: MemberRole.admin(),
    }, id);
  }

  // Reconstitute from persistence (bypass validation)
  static reconstitute(
    id: string,
    props: MemberProps,
    createdAt: Date,
    updatedAt: Date
  ): Member {
    return new Member(id, props, createdAt, updatedAt);
  }

  // Business methods
  changeRole(newRole: MemberRole): Result<void> {
    // Cannot demote self if admin
    if (this._role.isAdmin() && !newRole.isAdmin()) {
      return Result.fail("Admin cannot demote themselves");
    }

    this._role = newRole;
    this.touch();
    return Result.ok(undefined);
  }

  promoteToModerator(): Result<void> {
    if (this._role.isAdmin()) {
      return Result.fail("Admin cannot be promoted to moderator");
    }
    this._role = MemberRole.moderator();
    this.touch();
    return Result.ok(undefined);
  }

  demoteToGuest(): Result<void> {
    if (this._role.isAdmin()) {
      return Result.fail("Admin cannot be demoted");
    }
    this._role = MemberRole.guest();
    this.touch();
    return Result.ok(undefined);
  }

  // Permission checks
  canManageChannels(): boolean {
    return this._role.canManageChannels();
  }

  canManageMembers(): boolean {
    return this._role.canManageMembers();
  }

  canKickMembers(): boolean {
    return this._role.canKickMembers();
  }

  canDeleteMessages(): boolean {
    return this._role.canDeleteMessages();
  }

  isAdmin(): boolean {
    return this._role.isAdmin();
  }

  isModerator(): boolean {
    return this._role.isModerator();
  }

  isGuest(): boolean {
    return this._role.isGuest();
  }

  belongsToProfile(profileId: string): boolean {
    return this._profileId === profileId;
  }

  belongsToServer(serverId: string): boolean {
    return this._serverId === serverId;
  }
}
