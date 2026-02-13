import { ValueObject } from "../core/ValueObject";

export enum MemberRoleType {
  ADMIN = "ADMIN",
  MODERATOR = "MODERATOR",
  GUEST = "GUEST",
}

interface MemberRoleProps {
  value: MemberRoleType;
}

export class MemberRole extends ValueObject<MemberRoleProps> {
  private constructor(props: MemberRoleProps) {
    super(props);
  }

  get value(): MemberRoleType {
    return this.props.value;
  }

  static admin(): MemberRole {
    return new MemberRole({ value: MemberRoleType.ADMIN });
  }

  static moderator(): MemberRole {
    return new MemberRole({ value: MemberRoleType.MODERATOR });
  }

  static guest(): MemberRole {
    return new MemberRole({ value: MemberRoleType.GUEST });
  }

  static fromString(role: string): MemberRole {
    switch (role.toUpperCase()) {
      case "ADMIN":
        return MemberRole.admin();
      case "MODERATOR":
        return MemberRole.moderator();
      default:
        return MemberRole.guest();
    }
  }

  isAdmin(): boolean {
    return this.props.value === MemberRoleType.ADMIN;
  }

  isModerator(): boolean {
    return this.props.value === MemberRoleType.MODERATOR;
  }

  isGuest(): boolean {
    return this.props.value === MemberRoleType.GUEST;
  }

  canManageChannels(): boolean {
    return this.isAdmin();
  }

  canManageMembers(): boolean {
    return this.isAdmin() || this.isModerator();
  }

  canKickMembers(): boolean {
    return this.isAdmin() || this.isModerator();
  }

  canDeleteMessages(): boolean {
    return this.isAdmin() || this.isModerator();
  }

  toString(): string {
    return this.props.value;
  }
}
