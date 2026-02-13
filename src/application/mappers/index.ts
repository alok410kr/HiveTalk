import { Profile } from "../../domain/entities/Profile";
import { Server } from "../../domain/entities/Server";
import { Member } from "../../domain/entities/Member";
import { Channel } from "../../domain/entities/Channel";
import { Message } from "../../domain/entities/Message";
import { DirectMessage } from "../../domain/entities/DirectMessage";
import { Conversation } from "../../domain/entities/Conversation";
import {
  ProfileResponseDto,
  ServerResponseDto,
  ServerWithMembersDto,
  MemberResponseDto,
  ChannelResponseDto,
  MessageResponseDto,
  DirectMessageResponseDto,
  ConversationResponseDto,
} from "../dtos";

// Profile Mapper
export class ProfileMapper {
  static toDto(profile: Profile): ProfileResponseDto {
    return {
      id: profile.id,
      userId: profile.userId,
      name: profile.name,
      imageUrl: profile.imageUrl,
      email: profile.email,
      createdAt: profile.createdAt.toISOString(),
      updatedAt: profile.updatedAt.toISOString(),
    };
  }
}

// Server Mapper
export class ServerMapper {
  static toDto(server: Server): ServerResponseDto {
    return {
      id: server.id,
      name: server.name,
      imageUrl: server.imageUrl,
      inviteCode: server.inviteCode.value,
      profileId: server.profileId,
      createdAt: server.createdAt.toISOString(),
      updatedAt: server.updatedAt.toISOString(),
    };
  }

  static toDetailedDto(
    server: Server,
    members: Array<{ member: Member; profile: Profile }>,
    channels: Channel[]
  ): ServerWithMembersDto {
    return {
      ...ServerMapper.toDto(server),
      members: members.map(({ member, profile }) =>
        MemberMapper.toDto(member, profile)
      ),
      channels: channels.map((channel) => ChannelMapper.toDto(channel)),
      memberCount: members.length,
    };
  }
}

// Member Mapper
export class MemberMapper {
  static toDto(member: Member, profile?: Profile): MemberResponseDto {
    return {
      id: member.id,
      role: member.role.value,
      profileId: member.profileId,
      serverId: member.serverId,
      profile: profile ? ProfileMapper.toDto(profile) : undefined,
      createdAt: member.createdAt.toISOString(),
      updatedAt: member.updatedAt.toISOString(),
    };
  }
}

// Channel Mapper
export class ChannelMapper {
  static toDto(channel: Channel): ChannelResponseDto {
    return {
      id: channel.id,
      name: channel.name,
      type: channel.type.value,
      profileId: channel.profileId,
      serverId: channel.serverId,
      createdAt: channel.createdAt.toISOString(),
      updatedAt: channel.updatedAt.toISOString(),
    };
  }
}

// Message Mapper
export class MessageMapper {
  static toDto(message: Message, member?: Member, profile?: Profile): MessageResponseDto {
    return {
      id: message.id,
      content: message.content,
      fileUrl: message.fileUrl,
      deleted: message.deleted,
      memberId: message.memberId,
      channelId: message.channelId,
      member: member && profile ? MemberMapper.toDto(member, profile) : undefined,
      createdAt: message.createdAt.toISOString(),
      updatedAt: message.updatedAt.toISOString(),
    };
  }
}

// Direct Message Mapper
export class DirectMessageMapper {
  static toDto(
    directMessage: DirectMessage,
    member?: Member,
    profile?: Profile
  ): DirectMessageResponseDto {
    return {
      id: directMessage.id,
      content: directMessage.content,
      fileUrl: directMessage.fileUrl,
      deleted: directMessage.deleted,
      memberId: directMessage.memberId,
      conversationId: directMessage.conversationId,
      member: member && profile ? MemberMapper.toDto(member, profile) : undefined,
      createdAt: directMessage.createdAt.toISOString(),
      updatedAt: directMessage.updatedAt.toISOString(),
    };
  }
}

// Conversation Mapper
export class ConversationMapper {
  static toDto(
    conversation: Conversation,
    memberOne?: { member: Member; profile: Profile },
    memberTwo?: { member: Member; profile: Profile }
  ): ConversationResponseDto {
    return {
      id: conversation.id,
      memberOneId: conversation.memberOneId,
      memberTwoId: conversation.memberTwoId,
      memberOne: memberOne
        ? MemberMapper.toDto(memberOne.member, memberOne.profile)
        : undefined,
      memberTwo: memberTwo
        ? MemberMapper.toDto(memberTwo.member, memberTwo.profile)
        : undefined,
    };
  }
}
