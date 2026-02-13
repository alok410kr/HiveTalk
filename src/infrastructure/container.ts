/**
 * Dependency Injection Container
 * 
 * This module provides a simple DI container for managing dependencies.
 * In a production app, you might use a library like tsyringe, inversify, or awilix.
 */

import { PrismaClient } from "@prisma/client";

// Repositories
import { IProfileRepository } from "../domain/repositories/IProfileRepository";
import { IServerRepository } from "../domain/repositories/IServerRepository";
import { IMemberRepository } from "../domain/repositories/IMemberRepository";
import { IChannelRepository } from "../domain/repositories/IChannelRepository";
import { IMessageRepository } from "../domain/repositories/IMessageRepository";
import { IConversationRepository } from "../domain/repositories/IConversationRepository";
import { IDirectMessageRepository } from "../domain/repositories/IDirectMessageRepository";

import {
  PrismaProfileRepository,
  PrismaServerRepository,
  PrismaMemberRepository,
  PrismaChannelRepository,
  PrismaMessageRepository,
  PrismaConversationRepository,
  PrismaDirectMessageRepository,
} from "../infrastructure/repositories";

// Use Cases
import {
  CreateServerUseCase,
  GetServerUseCase,
  UpdateServerUseCase,
  DeleteServerUseCase,
  RegenerateInviteCodeUseCase,
  JoinServerUseCase,
  LeaveServerUseCase,
} from "../application/use-cases/server";

import {
  CreateChannelUseCase,
  UpdateChannelUseCase,
  DeleteChannelUseCase,
} from "../application/use-cases/channel";

import {
  UpdateMemberRoleUseCase,
  KickMemberUseCase,
} from "../application/use-cases/member";

import {
  SendMessageUseCase,
  GetMessagesUseCase,
  UpdateMessageUseCase,
  DeleteMessageUseCase,
} from "../application/use-cases/message";

import {
  GetDirectMessagesUseCase,
} from "../application/use-cases/direct-message";

// Singleton PrismaClient
let prismaClient: PrismaClient | null = null;

function getPrismaClient(): PrismaClient {
  if (!prismaClient) {
    prismaClient = new PrismaClient();
  }
  return prismaClient;
}

// Repository Factory
export interface IRepositories {
  profile: IProfileRepository;
  server: IServerRepository;
  member: IMemberRepository;
  channel: IChannelRepository;
  message: IMessageRepository;
  conversation: IConversationRepository;
  directMessage: IDirectMessageRepository;
}

let repositories: IRepositories | null = null;

export function getRepositories(): IRepositories {
  if (!repositories) {
    const prisma = getPrismaClient();
    repositories = {
      profile: new PrismaProfileRepository(prisma),
      server: new PrismaServerRepository(prisma),
      member: new PrismaMemberRepository(prisma),
      channel: new PrismaChannelRepository(prisma),
      message: new PrismaMessageRepository(prisma),
      conversation: new PrismaConversationRepository(prisma),
      directMessage: new PrismaDirectMessageRepository(prisma),
    };
  }
  return repositories;
}

// Use Case Factory
export interface IUseCases {
  // Server
  createServer: CreateServerUseCase;
  getServer: GetServerUseCase;
  updateServer: UpdateServerUseCase;
  deleteServer: DeleteServerUseCase;
  regenerateInviteCode: RegenerateInviteCodeUseCase;
  joinServer: JoinServerUseCase;
  leaveServer: LeaveServerUseCase;
  
  // Channel
  createChannel: CreateChannelUseCase;
  updateChannel: UpdateChannelUseCase;
  deleteChannel: DeleteChannelUseCase;
  
  // Member
  updateMemberRole: UpdateMemberRoleUseCase;
  kickMember: KickMemberUseCase;
  
  // Message
  sendMessage: SendMessageUseCase;
  getMessages: GetMessagesUseCase;
  updateMessage: UpdateMessageUseCase;
  deleteMessage: DeleteMessageUseCase;
  
  // Direct Message
  getDirectMessages: GetDirectMessagesUseCase;
}

let useCases: IUseCases | null = null;

export function getUseCases(): IUseCases {
  if (!useCases) {
    const repos = getRepositories();
    
    useCases = {
      // Server
      createServer: new CreateServerUseCase(repos.server, repos.member, repos.channel),
      getServer: new GetServerUseCase(repos.server, repos.member, repos.channel),
      updateServer: new UpdateServerUseCase(repos.server, repos.member),
      deleteServer: new DeleteServerUseCase(repos.server, repos.member),
      regenerateInviteCode: new RegenerateInviteCodeUseCase(repos.server, repos.member),
      joinServer: new JoinServerUseCase(repos.server, repos.member),
      leaveServer: new LeaveServerUseCase(repos.server, repos.member),
      
      // Channel
      createChannel: new CreateChannelUseCase(repos.channel, repos.member),
      updateChannel: new UpdateChannelUseCase(repos.channel, repos.member),
      deleteChannel: new DeleteChannelUseCase(repos.channel, repos.member),
      
      // Member
      updateMemberRole: new UpdateMemberRoleUseCase(repos.member),
      kickMember: new KickMemberUseCase(repos.member),
      
      // Message
      sendMessage: new SendMessageUseCase(repos.message, repos.member, repos.channel),
      getMessages: new GetMessagesUseCase(repos.message, repos.member, repos.channel),
      updateMessage: new UpdateMessageUseCase(repos.message, repos.member),
      deleteMessage: new DeleteMessageUseCase(repos.message, repos.member),
      
      // Direct Message
      getDirectMessages: new GetDirectMessagesUseCase(repos.directMessage, repos.conversation, repos.member),
    };
  }
  return useCases;
}

// Convenience function to get a specific use case
export function useCase<K extends keyof IUseCases>(name: K): IUseCases[K] {
  return getUseCases()[name];
}

// For testing - reset the container
export function resetContainer(): void {
  prismaClient = null;
  repositories = null;
  useCases = null;
}

// For testing - inject mock dependencies
export function injectRepositories(mockRepos: Partial<IRepositories>): void {
  const repos = getRepositories();
  repositories = { ...repos, ...mockRepos };
  useCases = null; // Reset use cases to pick up new repos
}
