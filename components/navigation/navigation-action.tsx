"use client";

import React from "react";
import { Plus } from "lucide-react";

import { ActionTooltip } from "@/components/action-tooltip";
import { useModal } from "@/hooks/use-modal-store";

export function NavigationAction() {
  const { onOpen } = useModal();

  return (
    <div>
      <ActionTooltip side="right" align="center" label="Add a server">
        <button
          onClick={() => onOpen("createServer")}
          className="group flex items-center"
          aria-label="Add a server"
        >
          <div className="flex mx-3 h-[48px] w-[48px] rounded-[24px] group-hover:rounded-[16px] transition-all overflow-hidden items-center justify-center bg-zinc-800 group-hover:bg-emerald-600">
            <Plus
              className="group-hover:text-white transition text-zinc-400"
              size={24}
            />
          </div>
        </button>
      </ActionTooltip>
    </div>
  );
}