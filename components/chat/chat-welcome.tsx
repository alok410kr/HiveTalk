import React from "react";
import { Hash } from "lucide-react";

interface ChatWelcomeProps {
  name: string;
  type: "channel" | "conversation";
}

export function ChatWelcome({ name, type }: ChatWelcomeProps) {
  return (
    <div className="space-y-2 px-4 mb-4">
      {type === "channel" && (
        <div className="h-16 w-16 rounded-lg bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center">
          <Hash className="h-8 w-8 text-zinc-500 dark:text-zinc-400" />
        </div>
      )}
      <p className="text-lg md:text-xl font-semibold text-zinc-800 dark:text-zinc-100">
        {type === "channel" ? "Welcome to " : ""}
        {name}
      </p>
      <p className="text-zinc-500 dark:text-zinc-400 text-sm">
        {type === "channel"
          ? `This is the start of the ${name} channel.`
          : `This is the start of your conversation with ${name}`}
      </p>
    </div>
  );
}