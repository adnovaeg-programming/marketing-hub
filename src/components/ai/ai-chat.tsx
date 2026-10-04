"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import {
  Sparkles,
  Plus,
  Send,
  Loader2,
  MessageSquare,
  Trash2,
  Wand2,
  Target,
  FileText,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  createAIConversationAction,
  sendAIMessageAction,
  deleteAIConversationAction,
} from "@/lib/ai/actions";

type Conversation = {
  id: string;
  title: string;
  mode: string;
  updated_at: string;
};

type Message = {
  id: string;
  conversation_id: string;
  role: string;
  content: string;
  created_at: string;
};

const MODE_ICONS: Record<string, typeof Sparkles> = {
  content: FileText,
  ads: Target,
  strategy: Wand2,
  general: Sparkles,
};

export function AIChat({
  conversations,
  workspaceId,
}: {
  conversations: Conversation[];
  workspaceId: string;
}) {
  const t = useTranslations("dashboard.ai");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [selectedId, setSelectedId] = useState<string | null>(
    conversations[0]?.id ?? null
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");
  const [selectedMode, setSelectedMode] = useState<
    "content" | "ads" | "strategy" | "general"
  >("general");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!selectedId) {
      setMessages([]);
      return;
    }

    const load = async () => {
      setLoading(true);
      const supabase = createClient();
      const { data } = await supabase
        .from("ai_messages")
        .select("*")
        .eq("conversation_id", selectedId)
        .order("created_at", { ascending: true });
      setMessages(data ?? []);
      setLoading(false);
    };

    load();
  }, [selectedId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleNewConversation = () => {
    startTransition(async () => {
      const result = await createAIConversationAction(selectedMode);
      if (!result.success) {
        toast.error("فشل الإنشاء");
        return;
      }
      setSelectedId(result.data);
      router.refresh();
    });
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    // لو مفيش conversation → نعمل واحدة
    let convId = selectedId;
    if (!convId) {
      const createResult = await createAIConversationAction(selectedMode);
      if (!createResult.success) {
        toast.error("فشل الإنشاء");
        return;
      }
      convId = createResult.data;
      setSelectedId(convId);
    }

    const userMsg = content;
    setContent("");

    // Optimistic UI
    const tempId = `temp-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      {
        id: tempId,
        conversation_id: convId!,
        role: "user",
        content: userMsg,
        created_at: new Date().toISOString(),
      },
    ]);

    const result = await sendAIMessageAction(convId, userMsg);

    if (!result.success) {
      toast.error("فشل الإرسال");
      return;
    }

    // إعادة تحميل الرسائل
    const supabase = createClient();
    const { data } = await supabase
      .from("ai_messages")
      .select("*")
      .eq("conversation_id", convId)
      .order("created_at", { ascending: true });
    setMessages(data ?? []);
    router.refresh();
  };

  const handleDelete = (id: string) => {
    if (!confirm(t("confirmDelete"))) return;
    startTransition(async () => {
      const result = await deleteAIConversationAction(id);
      if (!result.success) {
        toast.error("فشل الحذف");
        return;
      }
      if (selectedId === id) setSelectedId(null);
      router.refresh();
    });
  };

  const modes: { key: typeof selectedMode; label: string; icon: typeof Sparkles }[] = [
    { key: "general", label: t("modes.general"), icon: Sparkles },
    { key: "content", label: t("modes.content"), icon: FileText },
    { key: "ads", label: t("modes.ads"), icon: Target },
    { key: "strategy", label: t("modes.strategy"), icon: Wand2 },
  ];

  return (
    <div className="glass-strong grid h-[calc(100vh-16rem)] grid-cols-1 overflow-hidden rounded-3xl md:grid-cols-[280px_1fr]">
      {/* Sidebar */}
      <aside className="border-e border-border/40 overflow-y-auto">
        <div className="p-3">
          <Button
            onClick={handleNewConversation}
            disabled={pending}
            className="w-full rounded-xl bg-gradient-to-r from-primary to-accent shadow-lg shadow-primary/30"
          >
            {pending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Plus className="size-4" />
            )}
            {t("newConversation")}
          </Button>

          <div className="mt-3 grid grid-cols-2 gap-1">
            {modes.map((mode) => {
              const Icon = mode.icon;
              const isActive = selectedMode === mode.key;
              return (
                <button
                  key={mode.key}
                  onClick={() => setSelectedMode(mode.key)}
                  className={`flex flex-col items-center gap-1 rounded-lg p-2 text-[10px] transition ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted/50"
                  }`}
                >
                  <Icon className="size-3.5" />
                  {mode.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="border-t border-border/40 p-2">
          <p className="px-3 py-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            {t("history")}
          </p>
          {conversations.length === 0 ? (
            <p className="px-3 py-2 text-xs text-muted-foreground">
              {t("noHistory")}
            </p>
          ) : (
            conversations.map((conv) => {
              const Icon = MODE_ICONS[conv.mode] ?? Sparkles;
              const isActive = selectedId === conv.id;
              return (
                <div
                  key={conv.id}
                  className={`group flex items-center gap-2 rounded-xl p-2 transition ${
                    isActive ? "bg-primary/10" : "hover:bg-muted/50"
                  }`}
                >
                  <button
                    onClick={() => setSelectedId(conv.id)}
                    className="flex min-w-0 flex-1 items-center gap-2 text-start"
                  >
                    <Icon
                      className={`size-3.5 shrink-0 ${isActive ? "text-primary" : "text-muted-foreground"}`}
                    />
                    <span
                      className={`truncate text-xs ${isActive ? "text-primary" : "text-muted-foreground"}`}
                    >
                      {conv.title}
                    </span>
                  </button>
                  <button
                    onClick={() => handleDelete(conv.id)}
                    className="shrink-0 text-muted-foreground opacity-0 transition hover:text-destructive group-hover:opacity-100"
                  >
                    <Trash2 className="size-3" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </aside>

      {/* Main Chat */}
      <section className="flex h-full flex-col">
        {!selectedId ? (
          <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
            <div className="mx-auto flex size-20 items-center justify-center rounded-3xl bg-gradient-to-br from-primary to-accent shadow-2xl shadow-primary/30">
              <Sparkles className="size-10 text-white" />
            </div>
            <h2 className="mt-6 text-2xl font-bold">{t("welcome")}</h2>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              {t("welcomeDescription")}
            </p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-6">
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="size-5 animate-spin text-muted-foreground" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <MessageSquare className="size-10 text-muted-foreground/30" />
                  <p className="mt-3 text-sm text-muted-foreground">
                    {t("startConversation")}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg) => {
                    const isUser = msg.role === "user";
                    return (
                      <div
                        key={msg.id}
                        className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}
                      >
                        <div
                          className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${
                            isUser
                              ? "bg-muted text-muted-foreground"
                              : "bg-gradient-to-br from-primary to-accent text-white"
                          }`}
                        >
                          {isUser ? (
                            <span className="text-xs font-bold">U</span>
                          ) : (
                            <Sparkles className="size-4" />
                          )}
                        </div>
                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                            isUser
                              ? "bg-gradient-to-br from-primary to-accent text-white"
                              : "glass"
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words">
                            {msg.content}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={bottomRef} />
                </div>
              )}
            </div>

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
                disabled={!content.trim()}
                className="size-11 shrink-0 rounded-full bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/30"
              >
                <Send className="size-4 rtl:rotate-180" />
              </Button>
            </form>
          </>
        )}
      </section>
    </div>
  );
}