"use client";

import { cn } from "@/lib/utils";
import { Channel, ChannelType, MemberRole, Server } from "@prisma/client";
import { Edit, Hash, Lock, Mic, Trash, Video } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { ActionTooltip } from "../action-tooltip";
import { ModalType, useModal } from "@/hooks/use-modal-store";
import { actionAsyncStorage } from "next/dist/client/components/action-async-storage-instance";

interface ServerChannelProps {
  channel: Channel;
  server: Server;
  role?: MemberRole;
}

const iconMap = {
  [ChannelType.TEXT]: Hash,
  [ChannelType.AUDIO]: Mic,
  [ChannelType.VIDEO]: Video,
};

export const ServerChannel = ({
  channel,
  server,
  role,
}: ServerChannelProps) => {
  const { onOpen } = useModal();
  const params = useParams();
  const router = useRouter();

  const Icon = iconMap[channel.type];

  const onClick = () => {
    router.push(`/servers/${params?.serverId}/channels/${channel.id}`);
  };

  const onAction = (e: React.MouseEvent, action: ModalType) => {
    e.stopPropagation();
    onOpen(action, { channel, server });
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "group px-3 py-2 rounded-md flex items-center gap-x-2 w-full hover:bg-zinc-800/50 transition-colors mb-0.5",
        params?.channelId === channel.id && "bg-zinc-800"
      )}
    >
      <Icon className={cn(
        "flex-shrink-0 w-4 h-4 text-zinc-500",
        params?.channelId === channel.id && "text-zinc-300"
      )} />
      <p
        className={cn(
          "line-clamp-1 font-medium text-sm text-zinc-400 group-hover:text-zinc-200 transition",
          params?.channelId === channel.id &&
            "text-zinc-100"
        )}
      >
        {channel.name}
      </p>
      {channel.name !== "general" && role !== MemberRole.GUEST && (
        <div className="ml-auto flex items-center gap-x-2">
          <ActionTooltip label="Edit">
            <Edit
              onClick={(e) => onAction(e, "editChannel")}
              className="hidden group-hover:block h-4 w-4 text-zinc-400 hover:text-zinc-200 transition"
            />
          </ActionTooltip>

          <ActionTooltip label="Delete">
            <Trash
              onClick={(e) => onAction(e, "deleteChannel")}
              className="hidden group-hover:block h-4 w-4 text-zinc-400 hover:text-rose-500 transition"
            />
          </ActionTooltip>
        </div>
      )}

      {channel.name === "general" && (
        <Lock className="ml-auto h-4 w-4 text-zinc-400 dark:text-zinc-500" />
      )}
    </button>
  );
};
