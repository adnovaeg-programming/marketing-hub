"use client";

import { useState, useTransition } from "react";
import { Send, Loader2, MessageSquare } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { sendDisputeMessageAction } from "@/lib/messaging/actions";

type Message = {
  id: string;
  dispute_id: string;
  sender_id: string;
  message: string;
  is_internal: boolean;
  created_at: string;
  sender: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string;
    avatar_url: string | null;
  } | null;
};

export function DisputeChat({
  disputeId,
  messages,
  currentUserId,
  status,
}: {
  disputeId: string;
  messages: Message[];
  currentUserId: string;
  status: string;
}) {
  const t = useTranslations("dashboard.disputeDetails.chat");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [content, setContent] = useState("");

  const isClosed = status === "resolved" || status === "closed";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    startTransition(async () => {
      const result = await sendDisputeMessageAction(disputeId, content);
      if (!result.success) {
        toast.error("فشل الإرسال");
        return;
      }
      setContent("");
      router.refresh();
    });
  };

  return (
    <div className="glass-strong rounded-3xl p-6 md:p-8">
      <div className="mb-6 flex items-center gap-2">
        <MessageSquare className="size-5 text-primary" />
        <h2 className="text-lg font-semibold">{t("title")}</h2>
        <span className="rounded-full bg-muted/60 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
          {messages.length}
        </span>
      </div>

      {messages.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          {t("empty")}
        </p>
      ) : (
        <div className="space-y-3">
          {messages.map((msg) => {
            const isOwn = msg.sender_id === currentUserId;
            const senderName = msg.sender
              ? [msg.sender.first_name, msg.sender.last_name]
                  .filter(Boolean)
                  .join(" ") || msg.sender.email
              : t("unknownUser");
            const initial = senderName.charAt(0).toUpperCase();

            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isOwn ? "flex-row-reverse" : ""}`}
              >
                <div className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-primary to-accent text-xs font-bold text-white">
                  {msg.sender?.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={msg.sender.avatar_url}
                      alt={senderName}
                      className="size-full object-cover"
                    />
                  ) : (
                    initial
                  )}
                </div>

                <div className={`max-w-[80%] ${isOwn ? "text-end" : ""}`}>
                  <p className="text-[10px] text-muted-foreground">
                    {senderName} •{" "}
                    {new Date(msg.created_at).toLocaleString()}
                  </p>
                  <div
                    className={`mt-1 rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      isOwn
                        ? "bg-gradient-to-br from-primary to-accent text-white"
                        : "glass text-foreground"
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words text-start">
                      {msg.message}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!isClosed && (
        <form onSubmit={handleSubmit} className="mt-6 flex items-end gap-2">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t("placeholder")}
            rows={2}
            className="flex-1 resize-none rounded-2xl"
          />
          <Button
            type="submit"
            size="icon"
            disabled={pending || !content.trim()}
            className="size-11 shrink-0 rounded-full bg-gradient-to-br from-primary to-accent"
          >
            {pending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4 rtl:rotate-180" />
            )}
          </Button>
        </form>
      )}

      {isClosed && (
        <p className="mt-6 rounded-xl bg-muted/40 p-3 text-center text-xs text-muted-foreground">
          {t("closed")}
        </p>
      )}
    </div>
  );
}