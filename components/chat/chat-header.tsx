import React from "react";
import { Hash } from "lucide-react";

import { MobileToggle } from "@/components/mobile-toggle";
import { UserAvatar } from "@/components/user-avatar";
import { SocketIndicatior } from "@/components/socket-indicator";
import { ChatVideoButton } from "@/components/chat/chat-video-button";

interface ChatHeaderProps {
  serverId: string;
  name: string;
  type: "channel" | "conversation";
  imageUrl?: string;
}

export function ChatHeader({
  name,
  serverId,
  type,
  imageUrl
}: ChatHeaderProps) {
  return (
    <div className="px-4 flex items-center h-14 bg-[#f5f5f5] dark:bg-[#1e2124] border-b border-zinc-200 dark:border-zinc-700">
      <MobileToggle serverId={serverId} />
      {type === "channel" && (
        <div className="h-9 w-9 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mr-3">
          <Hash className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
        </div>
      )}
      {type === "conversation" && (
        <div className="relative mr-3">
          <UserAvatar
            src={imageUrl}
            className="h-9 w-9"
          />
          <div className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-[#1e2124]" />
        </div>
      )}
      <div className="flex flex-col">
        <p className="font-semibold text-sm text-zinc-800 dark:text-zinc-100">
          {type === "channel" ? name : name}
        </p>
      </div>
      <div className="ml-auto flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-500">
          <div className="h-2 w-2 rounded-full bg-emerald-500" />
          Live
        </div>
        {type === "conversation" && <ChatVideoButton />}
        <SocketIndicatior />
      </div>
    </div>
  );
}