"use client";

import { useState } from "react";
import { Loader2, Send, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { addTaskCommentAction } from "@/app/[locale]/dashboard/tasks/actions";

type Comment = {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  author: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string;
  } | null;
};

export function TaskComments({
  taskId,
  comments: initial,
  currentUserId,
}: {
  taskId: string;
  comments: Comment[];
  currentUserId: string;
}) {
  const t = useTranslations("dashboard.tasks.comments");
  const [comments, setComments] = useState(initial);
  const [pending, setPending] = useState(false);
  const [content, setContent] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setPending(true);
    const result = await addTaskCommentAction(taskId, content);
    setPending(false);

    if (result.success) {
      setContent("");
      // Hot reload via revalidatePath in action
    }
  };

  const handleDelete = (commentId: string) => {
    setComments((prev) => prev.filter((c) => c.id !== commentId));
  };

  return (
    <div className="glass-strong rounded-3xl p-6 md:p-8">
      <h2 className="text-lg font-semibold">
        {t("title")} {comments.length > 0 && <span className="text-muted-foreground">({comments.length})</span>}
      </h2>

      {/* Comments List */}
      {comments.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">{t("empty")}</p>
      ) : (
        <div className="mt-4 space-y-3">
          {comments.map((c) => {
            const name = c.author
              ? [c.author.first_name, c.author.last_name]
                  .filter(Boolean)
                  .join(" ") || c.author.email
              : "—";
            const initial = name.charAt(0).toUpperCase();
            const isOwn = c.user_id === currentUserId;

            return (
              <div key={c.id} className="glass flex gap-3 rounded-2xl p-4">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent text-xs font-bold text-white">
                  {initial}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium">{name}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {new Date(c.created_at).toLocaleString()}
                      </p>
                    </div>
                    {isOwn && (
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="text-muted-foreground transition hover:text-destructive"
                        aria-label="delete"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    )}
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">
                    {c.content}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Comment */}
      <form onSubmit={handleSubmit} className="mt-4 space-y-2">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={t("placeholder")}
          rows={3}
          disabled={pending}
        />
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={pending || !content.trim()}
            size="sm"
            className="rounded-full"
          >
            {pending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
            {t("submit")}
          </Button>
        </div>
      </form>
    </div>
  );
}