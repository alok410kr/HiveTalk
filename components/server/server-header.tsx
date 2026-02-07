"use client";

import { ServerWithMembersWithProfiles } from "@/types";
import { MemberRole, Server } from "@prisma/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChevronDown,
  LogOut,
  PlusCircle,
  Settings,
  Trash,
  UserPlus,
  Users,
} from "lucide-react";
import { useModal } from "@/hooks/use-modal-store";

interface ServerHeaderProps {
  server: ServerWithMembersWithProfiles;
  role?: MemberRole;
}

export const ServerHeader = ({ server, role }: ServerHeaderProps) => {
  const { onOpen } = useModal();

  const isAdmin = role === MemberRole.ADMIN;
  const isModerator = isAdmin || role === MemberRole.MODERATOR;

  return (
<DropdownMenu>
      <DropdownMenuTrigger className="focus: outline-none" asChild>
        <button className="w-full text-sm font-semibold px-4 flex items-center h-12 border-zinc-700 border-b bg-[#1e2124] hover:bg-zinc-800 transition text-zinc-100">
          {server.name}
          <ChevronDown className="w-4 h-4 ml-auto text-zinc-400" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 text-xs font-medium text-zinc-300 space-y-[2px] bg-[#1e2124] border-zinc-700 shadow-lg rounded-lg p-1.5">
        {isModerator && (
          <DropdownMenuItem
            onClick={() => {
              console.log("Invite People clicked");
              onOpen("invite", { server });
            }}
            className="text-emerald-500 px-3 py-2 text-sm cursor-pointer rounded-md hover:bg-emerald-500/10"
          >
            Invite People
            <UserPlus className="h-4 w-4 ml-auto" />
          </DropdownMenuItem>
        )}
        {isAdmin && (
          <DropdownMenuItem
            onClick={() => {
              console.log("Server Settings clicked");
              onOpen("editServer", { server });
            }}
            className="px-3 py-2 text-sm cursor-pointer rounded-md hover:bg-zinc-700"
          >
            Server Settings
            <Settings className="h-4 w-4 ml-auto" />
          </DropdownMenuItem>
        )}
        {isAdmin && (
          <DropdownMenuItem
            onClick={() => {
              console.log("Manage Members Clicked");
              onOpen("members", { server });
            }}
            className="px-3 py-2 text-sm cursor-pointer rounded-md hover:bg-zinc-700"
          >
            Manage Members
            <Users className="h-4 w-4 ml-auto" />
          </DropdownMenuItem>
        )}
        {isModerator && (
          <DropdownMenuItem
            onClick={() => onOpen("createChannel")}
            className="px-3 py-2 text-sm cursor-pointer rounded-md hover:bg-zinc-700"
          >
            Create Channels
            <PlusCircle className="h-4 w-4 ml-auto" />
          </DropdownMenuItem>
        )}
        {isModerator && <DropdownMenuSeparator />}
        {isAdmin && (
          <DropdownMenuItem
            onClick={() => onOpen("deleteServer", { server })}
            className="text-rose-500 px-3 py-2 text-sm cursor-pointer rounded-md hover:bg-rose-500/10"
          >
            Delete Server
            <Trash className="h-4 w-4 ml-auto" />
          </DropdownMenuItem>
        )}
        {!isAdmin && (
          <DropdownMenuItem
            onClick={() => {
              console.log("Leave server is clicked");
              onOpen("leaveServer", { server });
            }}
            className="text-rose-500 px-3 py-2 text-sm cursor-pointer rounded-md hover:bg-rose-500/10"
          >
            Leave Server
            <LogOut className="h-4 w-4 ml-auto" />
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
    