import { Conversation } from "../entities/Conversation";
import { Member } from "../entities/Member";
import { Profile } from "../entities/Profile";
import { Result } from "../../shared/Result";

export interface ConversationWithMembers {
  conversation: Conversation;
  memberOne: Member;
  memberTwo: Member;
  profileOne: Profile;
  profileTwo: Profile;
}

export interface IConversationRepository {
  findById(id: string): Promise<Conversation | null>;
  findByIdWithMembers(id: string): Promise<ConversationWithMembers | null>;
  findByMemberIds(memberOneId: string, memberTwoId: string): Promise<Conversation | null>;
  findOrCreate(memberOneId: string, memberTwoId: string): Promise<Result<Conversation>>;
  create(conversation: Conversation): Promise<Result<Conversation>>;
  delete(id: string): Promise<Result<void>>;
}
