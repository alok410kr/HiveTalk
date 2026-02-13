/**
 * API Version Configuration
 * 
 * Switch between v1 (legacy) and v2 (clean architecture) API endpoints.
 * 
 * To migrate:
 * 1. Set USE_V2_API = true
 * 2. Test thoroughly
 * 3. If issues occur, set back to false
 * 
 * V1 routes are backed up in app/api/_v1_backup/
 */

// Feature flag - set to true to use v2 clean architecture
export const USE_V2_API = true;

// API base paths
const V1_BASE = "/api";
const V2_BASE = "/api/v2";

// Get the correct API base
export const API_BASE = USE_V2_API ? V2_BASE : V1_BASE;

// API endpoint helpers
export const API = {
  // Server endpoints
  servers: {
    list: () => `${API_BASE}/servers`,
    create: () => `${API_BASE}/servers`,
    get: (serverId: string) => `${API_BASE}/servers/${serverId}`,
    update: (serverId: string) => `${API_BASE}/servers/${serverId}`,
    delete: (serverId: string) => `${API_BASE}/servers/${serverId}`,
    inviteCode: (serverId: string) => `${API_BASE}/servers/${serverId}/invite-code`,
    leave: (serverId: string) => `${API_BASE}/servers/${serverId}/leave`,
  },

  // Channel endpoints
  channels: {
    create: (serverId: string) => `${API_BASE}/channels?serverId=${serverId}`,
    update: (channelId: string, serverId: string) => `${API_BASE}/channels/${channelId}?serverId=${serverId}`,
    delete: (channelId: string, serverId: string) => `${API_BASE}/channels/${channelId}?serverId=${serverId}`,
  },

  // Member endpoints
  members: {
    update: (memberId: string, serverId: string) => `${API_BASE}/members/${memberId}?serverId=${serverId}`,
    kick: (memberId: string, serverId: string) => `${API_BASE}/members/${memberId}?serverId=${serverId}`,
  },

  // Message endpoints
  messages: {
    list: (channelId: string) => `${API_BASE}/messages?channelId=${channelId}`,
    create: (channelId: string) => `${API_BASE}/messages?channelId=${channelId}`,
    update: (messageId: string) => `${API_BASE}/messages/${messageId}`,
    delete: (messageId: string) => `${API_BASE}/messages/${messageId}`,
  },

  // Direct message endpoints
  directMessages: {
    list: (conversationId: string) => `${API_BASE}/direct-messages?conversationId=${conversationId}`,
  },

  // Livekit (v1 only - external service integration)
  livekit: () => `/api/livekit`,

  // UploadThing (v1 only - external service integration)
  uploadthing: () => `/api/uploadthing`,
};

// Helper to check which version is active
export const getApiVersion = () => USE_V2_API ? "v2" : "v1";
