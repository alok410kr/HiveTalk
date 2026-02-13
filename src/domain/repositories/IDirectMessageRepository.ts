import { DirectMessage } from "../entities/DirectMessage";
import { Member } from "../entities/Member";
import { Profile } from "../entities/Profile";
import { Result } from "../../shared/Result";

export interface DirectMessageWithMember {
  directMessage: DirectMessage;
  member: Member;
  profile: Profile;
}

export interface PaginatedDirectMessages {
  messages: DirectMessageWithMember[];
  nextCursor: string | undefined;
}

export interface IDirectMessageRepository {
  findById(id: string): Promise<DirectMessage | null>;
  findByIdWithMember(id: string): Promise<DirectMessageWithMember | null>;
  findByConversationId(conversationId: string, cursor?: string, limit?: number): Promise<PaginatedDirectMessages>;
  create(directMessage: DirectMessage): Promise<Result<DirectMessage>>;
  update(directMessage: DirectMessage): Promise<Result<DirectMessage>>;
  delete(id: string): Promise<Result<void>>;
  softDelete(id: string): Promise<Result<void>>;
}
