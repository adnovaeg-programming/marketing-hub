import { createClient } from "@/lib/supabase/client";

export type UploadBucket =
  | "avatars"
  | "content-assets"
  | "task-attachments"
  | "client-files";

export type UploadResult =
  | { success: true; fileId: string; path: string; url: string }
  | { success: false; error: string };

function generateFileName(original: string): string {
  const ext = original.split(".").pop() ?? "bin";
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 10);
  return `${timestamp}-${random}.${ext}`;
}

function getPublicUrl(bucket: UploadBucket, path: string): string {
  const supabase = createClient();
  if (bucket === "avatars") {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  }
  // للملفات الخاصة، نستخدم signed URL عند الطلب
  return "";
}

export async function uploadFile({
  file,
  bucket,
  workspaceId,
  userId,
  folder,
}: {
  file: File;
  bucket: UploadBucket;
  workspaceId: string;
  userId: string;
  folder?: string;
}): Promise<UploadResult> {
  const supabase = createClient();

  // المسار:
  // - avatars: {user_id}/{filename}
  // - الباقي: {workspace_id}/{folder?}/{filename}
  const fileName = generateFileName(file.name);
  const path =
    bucket === "avatars"
      ? `${userId}/${fileName}`
      : `${workspaceId}/${folder ? folder + "/" : ""}${fileName}`;

  // ارفع الملف
  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    return { success: false, error: uploadError.message };
  }

  // سجّل في جدول files
  const { data: fileRecord, error: dbError } = await supabase
    .from("files")
    .insert({
      workspace_id: workspaceId,
      uploaded_by: userId,
      bucket,
      storage_path: path,
      original_name: file.name,
      mime_type: file.type,
      size: file.size,
    })
    .select("id")
    .single();

  if (dbError || !fileRecord) {
    // نظّف الملف المرفوع لو فشل الـ DB
    await supabase.storage.from(bucket).remove([path]);
    return { success: false, error: dbError?.message ?? "DB insert failed" };
  }

  return {
    success: true,
    fileId: fileRecord.id,
    path,
    url: getPublicUrl(bucket, path),
  };
}

export async function deleteFile({
  fileId,
  bucket,
  path,
}: {
  fileId: string;
  bucket: UploadBucket;
  path: string;
}): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  const { error: storageError } = await supabase.storage
    .from(bucket)
    .remove([path]);

  if (storageError) return { success: false, error: storageError.message };

  const { error: dbError } = await supabase
    .from("files")
    .delete()
    .eq("id", fileId);

  if (dbError) return { success: false, error: dbError.message };

  return { success: true };
}

export async function getSignedUrl({
  bucket,
  path,
  expiresIn = 3600,
}: {
  bucket: UploadBucket;
  path: string;
  expiresIn?: number;
}): Promise<string | null> {
  const supabase = createClient();
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn);

  if (error) return null;
  return data.signedUrl;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}