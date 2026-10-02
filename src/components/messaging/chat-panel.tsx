"use client";

import { useState, useEffect, useRef } from "react";
import { Send, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  sendMessageAction,
  markConversationReadAction,
} from "@/lib/messaging/actions";

type User = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  avatar_url: string | null;
};

type Member = {
  user_id: string;
  last_read_at: string | null;
  user: User | null;
};

type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
};

export function ChatPanel({
  conversationId,
  members,
  currentUserId,
}: {
  conversationId: string;
  members: Member[];
  currentUserId: string;
}) {
  const t = useTranslations("dashboard.messages");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [content, setContent] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const other = members.find((m) => m.user_id !== currentUserId);
  const otherName = other?.user
    ? [other.user.first_name, other.user.last_name].filter(Boolean).join(" ") ||
      other.user.email
    : t("unknownUser");

  // Load messages + Realtime
  useEffect(() => {
    const supabase = createClient();

    const load = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true })
        .limit(200);
      setMessages(data ?? []);
      setLoading(false);
      await markConversationReadAction(conversationId);
    };

    load();

    // Realtime
    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
          if (newMsg.sender_id !== currentUserId) {
            markConversationReadAction(conversationId);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, currentUserId]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setSending(true);
    const result = await sendMessageAction(conversationId, content);
    setSending(false);

    if (!result.success) {
      toast.error("فشل الإرسال");
      return;
    }

    setContent("");
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="glass flex items-center gap-3 border-b border-border/40 p-4">
        <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-primary to-accent text-sm font-bold text-white">
          {other?.user?.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={other.user.avatar_url}
              alt={otherName}
              className="size-full object-cover"
            />
          ) : (
            otherName.charAt(0).toUpperCase()
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate font-semibold">{otherName}</p>
          <p className="truncate text-xs text-muted-foreground" dir="ltr">
            {other?.user?.email}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : messages.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            {t("noMessages")}
          </p>
        ) : (
          <div className="space-y-3">
            {messages.map((msg) => {
              const isOwn = msg.sender_id === currentUserId;
              return (
                <div
                  key={msg.id}
                  className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      isOwn
                        ? "bg-gradient-to-br from-primary to-accent text-white"
                        : "glass text-foreground"
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">
                      {msg.content}
                    </p>
                    <p
                      className={`mt-1 text-[10px] ${
                        isOwn ? "text-white/60" : "text-muted-foreground"
                      }`}
                    >
                      {new Date(msg.created_at).toLocaleTimeString(
                        undefined,
                        { hour: "2-digit", minute: "2-digit" }
                      )}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <form
        onSubmit={handleSend}
        className="glass flex items-end gap-2 border-t border-border/40 p-3"
      >
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={t("typeMessage")}
          rows={1}
          className="min-h-[44px] flex-1 resize-none rounded-2xl"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend(e);
            }
          }}
        />
        <Button
          type="submit"
          size="icon"
          disabled={sending || !content.trim()}
          className="size-11 shrink-0 rounded-full bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/30"
        >
          {sending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Send className="size-4 rtl:rotate-180" />
          )}
        </Button>
      </form>
    </div>
  );
}