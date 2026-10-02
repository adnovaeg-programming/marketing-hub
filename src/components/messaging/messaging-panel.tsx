"use client";

import { useState } from "react";
import { MessageSquare, Users } from "lucide-react";
import { useTranslations } from "next-intl";

import { ConversationList } from "@/components/messaging/conversation-list";
import { ChatPanel } from "@/components/messaging/chat-panel";

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

type Conversation = {
  id: string;
  type: string;
  title: string | null;
  last_message_at: string | null;
  last_message_preview: string | null;
  reference_type: string | null;
  reference_id: string | null;
  created_at: string;
  members: Member[];
};

export function MessagingPanel({
  conversations,
  currentUserId,
}: {
  conversations: Conversation[];
  currentUserId: string;
}) {
  const t = useTranslations("dashboard.messages");
  const [selectedId, setSelectedId] = useState<string | null>(
    conversations[0]?.id ?? null
  );

  const selected = conversations.find((c) => c.id === selectedId) ?? null;

  if (conversations.length === 0) {
    return (
      <div className="glass-strong flex flex-1 flex-col items-center justify-center rounded-3xl text-center">
        <div className="mx-auto flex size-20 items-center justify-center rounded-3xl bg-gradient-to-br from-primary to-accent shadow-2xl shadow-primary/30">
          <MessageSquare className="size-10 text-white" />
        </div>
        <h2 className="mt-6 text-2xl font-bold">{t("empty.title")}</h2>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          {t("empty.description")}
        </p>
      </div>
    );
  }

  return (
    <div className="glass-strong grid flex-1 grid-cols-1 overflow-hidden rounded-3xl md:grid-cols-[320px_1fr]">
      {/* Conversations List */}
      <aside className="border-e border-border/40 overflow-y-auto">
        <ConversationList
          conversations={conversations}
          currentUserId={currentUserId}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
      </aside>

      {/* Chat */}
      <section className="overflow-hidden">
        {selected ? (
          <ChatPanel
            conversationId={selected.id}
            members={selected.members}
            currentUserId={currentUserId}
          />
        ) : (
          <div className="flex h-full items-center justify-center p-8 text-center">
            <p className="text-sm text-muted-foreground">
              {t("selectConversation")}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}