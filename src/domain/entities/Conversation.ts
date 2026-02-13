import { Entity } from "../core/Entity";
import { Result } from "../../shared/Result";

export interface ConversationProps {
  memberOneId: string;
  memberTwoId: string;
}

export class Conversation extends Entity<string> {
  private _memberOneId: string;
  private _memberTwoId: string;

  private constructor(
    id: string,
    props: ConversationProps,
    createdAt?: Date,
    updatedAt?: Date
  ) {
    super(id, createdAt, updatedAt);
    this._memberOneId = props.memberOneId;
    this._memberTwoId = props.memberTwoId;
  }

  // Getters
  get memberOneId(): string {
    return this._memberOneId;
  }

  get memberTwoId(): string {
    return this._memberTwoId;
  }

  // Factory method
  static create(
    props: { memberOneId: string; memberTwoId: string },
    id?: string
  ): Result<Conversation> {
    if (!props.memberOneId) {
      return Result.fail("Member One ID is required");
    }

    if (!props.memberTwoId) {
      return Result.fail("Member Two ID is required");
    }

    if (props.memberOneId === props.memberTwoId) {
      return Result.fail("Cannot create a conversation with yourself");
    }

    const conversationId = id ?? crypto.randomUUID();

    // Ensure consistent ordering (memberOneId < memberTwoId) for uniqueness
    const [orderedMemberOneId, orderedMemberTwoId] = 
      props.memberOneId < props.memberTwoId
        ? [props.memberOneId, props.memberTwoId]
        : [props.memberTwoId, props.memberOneId];

    return Result.ok(new Conversation(conversationId, {
      memberOneId: orderedMemberOneId,
      memberTwoId: orderedMemberTwoId,
    }));
  }

  // Reconstitute from persistence
  static reconstitute(
    id: string,
    props: ConversationProps,
    createdAt: Date,
    updatedAt: Date
  ): Conversation {
    return new Conversation(id, props, createdAt, updatedAt);
  }

  // Business methods
  includesMember(memberId: string): boolean {
    return this._memberOneId === memberId || this._memberTwoId === memberId;
  }

  getOtherMemberId(memberId: string): string | null {
    if (this._memberOneId === memberId) {
      return this._memberTwoId;
    }
    if (this._memberTwoId === memberId) {
      return this._memberOneId;
    }
    return null;
  }

  // Get unique key for finding/creating conversations
  static getConversationKey(memberOneId: string, memberTwoId: string): string {
    const [first, second] = memberOneId < memberTwoId
      ? [memberOneId, memberTwoId]
      : [memberTwoId, memberOneId];
    return `${first}:${second}`;
  }
}
