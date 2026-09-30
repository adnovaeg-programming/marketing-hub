"use client";

import { useState, useEffect, useRef } from "react";
import {
  Paperclip,
  Loader2,
  X,
  File as FileIcon,
  Image as ImageIcon,
  Download,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  uploadFile,
  deleteFile,
  getSignedUrl,
  formatFileSize,
} from "@/lib/storage/upload";

type Attachment = {
  id: string;
  file_id: string;
  file: {
    id: string;
    bucket: string;
    storage_path: string;
    original_name: string;
    mime_type: string | null;
    size: number | null;
  } | null;
};

export function TaskAttachments({
  taskId,
  workspaceId,
  userId,
}: {
  taskId: string;
  workspaceId: string;
  userId: string;
}) {
  const t = useTranslations("files.attachments");
  const inputRef = useRef<HTMLInputElement>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("task_attachments")
          .select(
            `id, file_id,
             file:files (id, bucket, storage_path, original_name, mime_type, size)`
          )
          .eq("task_id", taskId)
          .order("created_at", { ascending: false });

        if (error) {
          console.warn("[TaskAttachments] Load error:", error.message);
        } else {
          setAttachments((data ?? []) as never);
        }
      } catch (err) {
        console.warn("[TaskAttachments] Failed:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [taskId]);

  const handleUpload = async (file: File) => {
    setError(null);
    setUploading(true);

    const result = await uploadFile({
      file,
      bucket: "task-attachments",
      workspaceId,
      userId,
    });

    if (!result.success) {
      setError(result.error);
      setUploading(false);
      return;
    }

    const supabase = createClient();
    const { data: link, error: linkError } = await supabase
      .from("task_attachments")
      .insert({
        task_id: taskId,
        file_id: result.fileId,
      })
      .select(
        `id, file_id,
         file:files (id, bucket, storage_path, original_name, mime_type, size)`
      )
      .single();

    if (linkError) {
      setError(linkError.message);
      setUploading(false);
      return;
    }

    setAttachments((prev) => [link as never, ...prev]);
    setUploading(false);
  };

  const handleDownload = async (att: Attachment) => {
    if (!att.file) return;
    const url = await getSignedUrl({
      bucket: att.file.bucket as never,
      path: att.file.storage_path,
      expiresIn: 300,
    });
    if (url) window.open(url, "_blank");
  };

  const handleDelete = async (att: Attachment) => {
    if (!att.file) return;
    if (!confirm(t("confirmDelete"))) return;

    const supabase = createClient();
    await supabase.from("task_attachments").delete().eq("id", att.id);
    await deleteFile({
      fileId: att.file.id,
      bucket: att.file.bucket as never,
      path: att.file.storage_path,
    });
    setAttachments((prev) => prev.filter((a) => a.id !== att.id));
  };

  return (
    <div className="glass-strong rounded-3xl p-6 md:p-8">
      <div className="flex items-center justify-between">
        <label className="text-lg font-semibold">{t("title")}</label>
        <Button
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="glass rounded-full"
        >
          {uploading ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Paperclip className="size-3.5" />
          )}
          {t("addFile")}
        </Button>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleUpload(f);
            e.target.value = "";
          }}
        />
      </div>

      {error && (
        <div className="mt-3 rounded-lg border border-destructive/30 bg-destructive/10 p-2 text-xs text-destructive">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-6">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </div>
      ) : attachments.length === 0 ? (
        <p className="mt-6 py-6 text-center text-sm text-muted-foreground">
          {t("empty")}
        </p>
      ) : (
        <div className="mt-4 space-y-2">
          {attachments.map((att) => (
            <div
              key={att.id}
              className="glass flex items-center gap-3 rounded-xl p-2.5"
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                {att.file?.mime_type?.startsWith("image/") ? (
                  <ImageIcon className="size-4 text-muted-foreground" />
                ) : (
                  <FileIcon className="size-4 text-muted-foreground" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium">
                  {att.file?.original_name ?? "—"}
                </p>
                {att.file?.size && (
                  <p className="text-[10px] text-muted-foreground">
                    {formatFileSize(att.file.size)}
                  </p>
                )}
              </div>

              <button
                onClick={() => handleDownload(att)}
                className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-primary/10 hover:text-primary"
                aria-label="Download"
              >
                <Download className="size-3.5" />
              </button>

              <button
                onClick={() => handleDelete(att)}
                className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
                aria-label="Delete"
              >
                <X className="size-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}