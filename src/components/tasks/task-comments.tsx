"use client";

import { useState, useTransition } from "react";
import { Loader2, Send, Trash2, AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  addTaskCommentAction,
  deleteTaskCommentAction,
} from "@/app/[locale]/dashboard/tasks/actions";

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
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);

  // ✅ إضافة تعليق جديد + عرضه فورًا
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || pending) return;

    setError(null);
    setPending(true);

    const optimisticContent = content.trim();

    // Optimistic update
    const tempId = `temp-${Date.now()}`;
    const tempComment: Comment = {
      id: tempId,
      content: optimisticContent,
      created_at: new Date().toISOString(),
      user_id: currentUserId,
      author: null, // هنخليه null مؤقتًا
    };
    setComments((prev) => [...prev, tempComment]);
    setContent("");

    const result = await addTaskCommentAction(taskId, optimisticContent);
    setPending(false);

    if (!result.success) {
      // Rollback
      setComments((prev) => prev.filter((c) => c.id !== tempId));
      setContent(optimisticContent);
      setError(t("errors.generic"));
      return;
    }

    // استبدل التعليق المؤقت بالحقيقي
    if ("comment" in result && result.comment) {
      setComments((prev) =>
        prev.map((c) => (c.id === tempId ? result.comment! : c))
      );
    }
  };

  // ✅ حذف فعلي من Supabase
  const handleDelete = async (commentId: string) => {
    if (!confirm(t("confirmDelete"))) return;

    setError(null);
    setDeletingId(commentId);

    // Optimistic remove
    const backup = comments;
    setComments((prev) => prev.filter((c) => c.id !== commentId));

    const result = await deleteTaskCommentAction(commentId, taskId);
    setDeletingId(null);

    if (!result.success) {
      // Rollback
      setComments(backup);
      setError(t("errors.generic"));
    }
  };

  return (
    <div className="glass-strong rounded-3xl p-6 md:p-8">
      <h2 className="text-lg font-semibold">
        {t("title")}{" "}
        {comments.length > 0 && (
          <span className="text-muted-foreground">({comments.length})</span>
        )}
      </h2>

      {/* Error */}
      {error && (
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

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
              : "…";
            const initial = name.charAt(0).toUpperCase();
            const isOwn = c.user_id === currentUserId;
            const isTemp = c.id.startsWith("temp-");
            const isDeleting = deletingId === c.id;

            return (
              <div
                key={c.id}
                className={`glass flex gap-3 rounded-2xl p-4 transition-opacity ${
                  isTemp || isDeleting ? "opacity-60" : ""
                }`}
              >
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
                    {isOwn && !isTemp && (
                      <button
                        type="button"
                        onClick={() => handleDelete(c.id)}
                        disabled={isDeleting}
                        className="text-muted-foreground transition hover:text-destructive disabled:opacity-50"
                        aria-label="delete"
                      >
                        {isDeleting ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="size-3.5" />
                        )}
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