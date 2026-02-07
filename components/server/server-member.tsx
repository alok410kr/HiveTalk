"use client";

import { cn } from "@/lib/utils";
import { Member, MemberRole, Profile, Server } from "@prisma/client";
import { ShieldAlert, ShieldCheck } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

import { UserAvatar } from "../user-avatar";

interface ServerMemberProps {
  member: Member & { profile: Profile };
  server: Server;
}
const roleIconMap = {
  [MemberRole.GUEST]: null,
  [MemberRole.MODERATOR]: (
    <ShieldCheck className="h-4 w-4 ml-2 text-indigo-500" />
  ),
  [MemberRole.ADMIN]: <ShieldAlert className="h-4 w-4 ml-2 text-rose-500" />,
};

export const ServerMember = ({ member, server }: ServerMemberProps) => {
  const params = useParams();
  const router = useRouter();

  const icon = roleIconMap[member.role];

  const onclick = () => {
    router.push(`/servers/${params?.serverId}/conversations/${member.id}`);
  };

  return (
    <button
     onClick={onclick}
      className={cn(
        "group px-3 py-2 rounded-md flex items-center gap-x-3 w-full hover:bg-zinc-800/50 transition-colors mb-0.5",
        params?.memberId === member.id && "bg-zinc-800"
      )}
    >
      <UserAvatar
        src={member.profile.imageUrl}
        className="h-7 w-7 md:h-7 md:w-7"
      />
      <p
        className={cn(
          "font-medium text-sm text-zinc-400 group-hover:text-zinc-200 transition",
          params?.memberId === member.id &&
            "text-zinc-100"
        )}
      >
        {member.profile.name}
      </p>
      {icon}
    </button>
  );
};
