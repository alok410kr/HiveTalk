import { Message } from "../entities/Message";
import { Member } from "../entities/Member";
import { Profile } from "../entities/Profile";
import { Result } from "../../shared/Result";

export interface MessageWithMember {
  message: Message;
  member: Member;
  profile: Profile;
}

export interface PaginatedMessages {
  messages: MessageWithMember[];
  nextCursor: string | undefined;
}

export interface IMessageRepository {
  findById(id: string): Promise<Message | null>;
  findByIdWithMember(id: string): Promise<MessageWithMember | null>;
  findByChannelId(channelId: string, cursor?: string, limit?: number): Promise<PaginatedMessages>;
  create(message: Message): Promise<Result<Message>>;
  update(message: Message): Promise<Result<Message>>;
  delete(id: string): Promise<Result<void>>;
  softDelete(id: string): Promise<Result<void>>;
}
