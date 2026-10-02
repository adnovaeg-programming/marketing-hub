"use client";

import { useTranslations } from "next-intl";

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
  last_message_at: string | null;
  last_message_preview: string | null;
  members: Member[];
};

export function ConversationList({
  conversations,
  currentUserId,
  selectedId,
  onSelect,
}: {
  conversations: Conversation[];
  currentUserId: string;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const t = useTranslations("dashboard.messages");

  const getOtherMember = (conv: Conversation) =>
    conv.members.find((m) => m.user_id !== currentUserId);

  const getDisplayName = (user: User | null | undefined) =>
    user
      ? [user.first_name, user.last_name].filter(Boolean).join(" ") ||
        user.email
      : t("unknownUser");

  return (
    <div className="p-2">
      <div className="px-3 py-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {t("conversations")}
      </div>

      {conversations.map((conv) => {
        const other = getOtherMember(conv);
        const name = getDisplayName(other?.user);
        const initial = name.charAt(0).toUpperCase();
        const isSelected = selectedId === conv.id;

        // Unread check
        const isUnread =
          conv.last_message_at &&
          other?.last_read_at &&
          new Date(conv.last_message_at) > new Date(other.last_read_at);

        return (
          <button
            key={conv.id}
            onClick={() => onSelect(conv.id)}
            className={`flex w-full items-center gap-3 rounded-xl p-3 text-start transition ${
              isSelected
                ? "bg-primary/10 text-primary"
                : "hover:bg-muted/50"
            }`}
          >
            <div className="relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-primary to-accent text-sm font-bold text-white">
              {other?.user?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={other.user.avatar_url}
                  alt={name}
                  className="size-full object-cover"
                />
              ) : (
                initial
              )}
              {isUnread && (
                <span className="absolute -top-0.5 -right-0.5 size-3 rounded-full border-2 border-background bg-primary" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{name}</p>
              <p className="truncate text-xs text-muted-foreground">
                {conv.last_message_preview ?? t("noMessages")}
              </p>
            </div>

            {conv.last_message_at && (
              <span className="shrink-0 text-[10px] text-muted-foreground/60">
                {new Date(conv.last_message_at).toLocaleDateString()}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}