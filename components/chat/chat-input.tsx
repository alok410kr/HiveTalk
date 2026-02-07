"use client";

import React from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import axios from "axios";
import qs from "query-string";
import { useRouter } from "next/navigation";

import {
  FormControl,
  Form,
  FormField,
  FormItem
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useModal } from "@/hooks/use-modal-store";
import { EmojiPicker } from "@/components/emoji-picker";

interface ChatInputProps {
  apiUrl: string;
  query: Record<string, any>;
  name: string;
  type: "conversation" | "channel";
}

const formSchema = z.object({
  content: z.string().min(1)
});

export function ChatInput({ apiUrl, query, name, type }: ChatInputProps) {
  const { onOpen } = useModal();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { content: "" }
  });

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const url = qs.stringifyUrl({
        url: apiUrl,
        query
      });

      await axios.post(url, values);

      form.reset();
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("An error occurred while sending the message. Please try again.");
    }
  };

  const placeholderName =
    type === "conversation" ? name || "conversation" : `#${name || "channel"}`;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="relative px-4 py-3 bg-white dark:bg-[#1e2124] border-t border-zinc-100 dark:border-zinc-800">
                  <div className="flex items-center gap-2 bg-zinc-50 dark:bg-[#2a2d32] rounded-lg px-3 py-2">
                    <button
                      type="button"
                      aria-label="Attach file"
                      onClick={() =>
                        onOpen("messageFile", { apiUrl, query })
                      }
                      className="h-8 w-8 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-700 flex items-center justify-center"
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                    <Input
                      placeholder={`Message ${type === "conversation" ? name : "#" + name}...`}
                      disabled={isLoading}
                      className="flex-1 border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-zinc-700 dark:text-zinc-200 placeholder:text-zinc-400 text-sm py-2"
                      {...field}
                    />
                    <EmojiPicker
                      onChange={(emoji: string) =>
                        field.onChange(`${field.value} ${emoji}`)
                      }
                    />
                    <button
                      type="submit"
                      disabled={isLoading || !field.value}
                      className="h-8 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-md flex items-center justify-center text-white text-sm font-medium"
                    >
                      Send
                    </button>
                  </div>
                </div>
              </FormControl>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
