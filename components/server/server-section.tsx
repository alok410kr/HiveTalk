"use client";

import { ServerWithMembersWithProfiles } from "@/types";
import { ChannelType, MemberRole } from "@prisma/client";
import { ActionTooltip } from "../action-tooltip";
import { Plus, Settings } from "lucide-react";
import { useModal } from "@/hooks/use-modal-store";

interface ServerSectionProps {
    label: string;
    role?:MemberRole;
    sectionType:"channels"|"members";
    channelType?:ChannelType;
    server?: ServerWithMembersWithProfiles;
}

export const ServerSection = ({
    label,
    role,
    sectionType,
    channelType,
    server,
}:ServerSectionProps) => {
    const {onOpen}= useModal();


    return ( 
        <div className="flex items-center justify-between py-2 px-2">
            <p className="text-xs uppercase font-semibold tracking-wide text-zinc-500">
                {label}
            </p>
            {role!==MemberRole.GUEST && sectionType==="channels" && (
                    <ActionTooltip label="Create Channel" side ="top">
                        <button 
                        onClick={()=>onOpen("createChannel",{channelType})}
                        className="text-zinc-500 hover:text-zinc-300 transition-colors">
                            <Plus className="h-4 w-4" />
                        </button>
                    </ActionTooltip>
                )}
                {role===MemberRole.ADMIN && sectionType==="members" && (
                        <ActionTooltip label="Manage Members" side ="top">
                        <button 
                        onClick={()=>onOpen("members",{server})}
                        className="text-zinc-500 hover:text-zinc-300 transition-colors">
                            <Settings className="h-4 w-4" />
                        </button>
                    </ActionTooltip>
                    )}
        </div>
     );
}
 