"use client";

import React, { useEffect, useState } from "react";
import { Member, MemberRole, Profile } from "@prisma/client";
import {
  Edit,
  FileIcon,
  ShieldAlert,
  ShieldCheck,
  Trash
} from "lucide-react";
import Image from "next/image";
import * as z from "zod";
import axios from "axios";
import qs from "query-string";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useParams } from "next/navigation";

import { UserAvatar } from "@/components/user-avatar";
import { ActionTooltip } from "@/components/action-tooltip";
import { cn } from "@/lib/utils";
import {
  Form,
  FormControl,
  FormField,
  FormItem
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useModal } from "@/hooks/use-modal-store";

interface ChatItemProps {
  id: string;
  content: string;
  member: Member & { profile: Profile };
  timestamp: string;
  fileUrl: string | null;
  deleted: boolean;
  currentMember: Member;
  isUpdated: boolean;
  socketUrl: string;
  socketQuery: Record<string, string>;
}

const roleIconMap = {
  GUEST: null,
  MODERATOR: <ShieldCheck className="h-4 w-4 ml-2 text-emerald-600" />,
  ADMIN: <ShieldAlert className="h-4 w-4 ml-2 text-rose-500" />
};

const formSchema = z.object({
  content: z.string().min(1)
});

export function ChatItem({
  id,
  content,
  member,
  timestamp,
  fileUrl,
  deleted,
  currentMember,
  isUpdated,
  socketUrl,
  socketQuery
}: ChatItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const { onOpen } = useModal();

  const params = useParams();
  const router = useRouter();

  const isOwner = currentMember.id === member.id;

  const onMemberClick = () => {
    if (member.id === currentMember.id) return;

    router.push(`/servers/${params?.serverId}/conversations/${member.id}`);
  };

  useEffect(() => {
    const handleKeyDown = (event: any) => {
      if (event.key === "Escape" || event.keyCode === 27) {
        setIsEditing(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content
    }
  });

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const url = qs.stringifyUrl({
        url: `${socketUrl}/${id}`,
        query: socketQuery
      });

      await axios.patch(url, values);

      form.reset();
      setIsEditing(false);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    form.reset({ content });
  }, [content, form]);

  const fileType = fileUrl?.split(".").pop();

  const isAdmin = currentMember.role === MemberRole.ADMIN;
  const isModerator = currentMember.role === MemberRole.MODERATOR;
  const canDeleteMessage = !deleted && (isAdmin || isModerator || isOwner);
  const canEditMessage = !deleted && isOwner && !fileUrl;
  const isPDF = fileType === "pdf" && fileUrl;
  const isImage = !isPDF && fileUrl;

  return (
    <div
      className={cn(
        "relative group flex items-end gap-2 py-2 px-4 transition w-full",
        isOwner ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar - only show for others' messages */}
      {!isOwner && (
        <div
          onClick={onMemberClick}
          className="cursor-pointer hover:opacity-80 transition flex-shrink-0"
        >
          <UserAvatar src={member.profile.imageUrl} className="h-8 w-8" />
        </div>
      )}

      {/* Message bubble */}
      <div
        className={cn(
          "flex flex-col max-w-[70%] min-w-[100px]",
          isOwner ? "items-end" : "items-start"
        )}
      >
        {/* Name and timestamp - only show name for others */}
        <div
          className={cn(
            "flex items-center gap-2 mb-1",
            isOwner ? "flex-row-reverse" : "flex-row"
          )}
        >
          {!isOwner && (
            <p
              onClick={onMemberClick}
              className="text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:underline cursor-pointer"
            >
              {member.profile.name}
            </p>
          )}
          {!isOwner && (
            <ActionTooltip label={member.role}>
              {roleIconMap[member.role]}
            </ActionTooltip>
          )}
        </div>

        {/* Message content bubble */}
        <div
          className={cn(
            "relative rounded-2xl px-4 py-2.5",
            isOwner
              ? "bg-emerald-600 text-white rounded-br-sm"
              : "bg-white dark:bg-[#2a2d32] text-zinc-800 dark:text-zinc-100 rounded-bl-sm",
            deleted && "opacity-60"
          )}
        >
          {isImage && (
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="relative aspect-square rounded-xl overflow-hidden flex items-center bg-secondary h-48 w-48"
            >
              <Image
                src={fileUrl}
                alt={content}
                fill
                className="object-cover"
              />
            </a>
          )}
          {isPDF && (
            <div className="relative flex items-center p-2 rounded-lg bg-white/10 dark:bg-black/10">
              <FileIcon className="h-8 w-8 fill-indigo-200 stroke-indigo-400" />
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "ml-2 text-sm hover:underline",
                  isOwner ? "text-white/90" : "text-indigo-500 dark:text-indigo-400"
                )}
              >
                PDF File
              </a>
            </div>
          )}
          {!fileUrl && !isEditing && (
            <p
              className={cn(
                "text-sm leading-relaxed",
                deleted && "italic text-xs"
              )}
            >
              {content}
              {isUpdated && !deleted && (
                <span
                  className={cn(
                    "text-[10px] mx-2",
                    isOwner ? "text-white/60" : "text-zinc-400"
                  )}
                >
                  (edited)
                </span>
              )}
            </p>
          )}
          {!fileUrl && isEditing && (
            <Form {...form}>
              <form
                className="flex items-center w-full gap-x-2"
                onSubmit={form.handleSubmit(onSubmit)}
              >
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input
                          disabled={isLoading}
                          placeholder="Edit message..."
                          className="p-2 bg-white dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 rounded-lg focus-visible:ring-1 focus-visible:ring-indigo-500 text-zinc-800 dark:text-zinc-200"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button disabled={isLoading} size="sm" className="bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg">
                  Save
                </Button>
              </form>
              <span className="text-[10px] mt-1 text-zinc-400">
                Esc to cancel, Enter to save
              </span>
            </Form>
          )}
        </div>

        {/* Timestamp */}
        <span
          className={cn(
            "text-[10px] text-zinc-400 mt-1 px-1",
            isOwner ? "text-right" : "text-left"
          )}
        >
          {timestamp}
        </span>
      </div>

      {/* Action buttons on hover */}
      {canDeleteMessage && (
        <div
          className={cn(
            "hidden group-hover:flex items-center gap-1 px-2 py-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-full shadow-lg",
            isOwner ? "order-first" : ""
          )}
        >
          {canEditMessage && (
            <ActionTooltip label="Edit">
              <Edit
                onClick={() => setIsEditing(true)}
                className="cursor-pointer w-4 h-4 text-zinc-500 hover:text-indigo-500 transition"
              />
            </ActionTooltip>
          )}
          <ActionTooltip label="Delete">
            <Trash
              onClick={() =>
                onOpen("deleteMessage", {
                  apiUrl: `${socketUrl}/${id}`,
                  query: socketQuery
                })
              }
              className="cursor-pointer w-4 h-4 text-zinc-500 hover:text-rose-500 transition"
            />
          </ActionTooltip>
        </div>
      )}
    </div>
  );
}