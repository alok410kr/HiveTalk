// Server DTOs for request/response data transfer

export interface CreateServerDto {
  name: string;
  imageUrl: string;
}

export interface UpdateServerDto {
  name?: string;
  imageUrl?: string;
}

export interface ServerResponseDto {
  id: string;
  name: string;
  imageUrl: string;
  inviteCode: string;
  profileId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ServerWithMembersDto extends ServerResponseDto {
  members: MemberResponseDto[];
  channels: ChannelResponseDto[];
  memberCount: number;
}

// Channel DTOs
export interface CreateChannelDto {
  name: string;
  type: "TEXT" | "AUDIO" | "VIDEO";
  serverId: string;
}

export interface UpdateChannelDto {
  name?: string;
  type?: "TEXT" | "AUDIO" | "VIDEO";
}

export interface ChannelResponseDto {
  id: string;
  name: string;
  type: "TEXT" | "AUDIO" | "VIDEO";
  profileId: string;
  serverId: string;
  createdAt: string;
  updatedAt: string;
}

// Member DTOs
export interface UpdateMemberRoleDto {
  role: "ADMIN" | "MODERATOR" | "GUEST";
}

export interface MemberResponseDto {
  id: string;
  role: "ADMIN" | "MODERATOR" | "GUEST";
  profileId: string;
  serverId: string;
  profile?: ProfileResponseDto;
  createdAt: string;
  updatedAt: string;
}

// Profile DTOs
export interface ProfileResponseDto {
  id: string;
  userId: string;
  name: string;
  imageUrl: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

// Message DTOs
export interface CreateMessageDto {
  content: string;
  fileUrl?: string;
  channelId: string;
}

export interface UpdateMessageDto {
  content: string;
}

export interface MessageResponseDto {
  id: string;
  content: string;
  fileUrl: string | null;
  deleted: boolean;
  memberId: string;
  channelId: string;
  member?: MemberResponseDto;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedMessagesDto {
  items: MessageResponseDto[];
  nextCursor?: string;
}

// Direct Message DTOs
export interface CreateDirectMessageDto {
  content: string;
  fileUrl?: string;
  conversationId: string;
}

export interface DirectMessageResponseDto {
  id: string;
  content: string;
  fileUrl: string | null;
  deleted: boolean;
  memberId: string;
  conversationId: string;
  member?: MemberResponseDto;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedDirectMessagesDto {
  items: DirectMessageResponseDto[];
  nextCursor?: string;
}

// Conversation DTOs
export interface ConversationResponseDto {
  id: string;
  memberOneId: string;
  memberTwoId: string;
  memberOne?: MemberResponseDto;
  memberTwo?: MemberResponseDto;
}

// Invite DTOs
export interface JoinServerByInviteDto {
  inviteCode: string;
}

export interface InviteResponseDto {
  inviteCode: string;
  serverName: string;
  serverImageUrl: string;
}
