"use client";

import { useState, useEffect } from "react";
import { Loader2, Plus, AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { createContentAction } from "@/app/[locale]/dashboard/content/actions";

type Client = { id: string; name: string };
type Project = { id: string; name: string };

const CONTENT_TYPES = [
  "post",
  "story",
  "reel",
  "video",
  "image",
  "article",
  "carousel",
] as const;

const PLATFORMS = [
  "instagram",
  "facebook",
  "tiktok",
  "x",
  "linkedin",
  "youtube",
] as const;

const PRIORITIES = ["low", "medium", "high", "urgent"] as const;

export function NewContentDialog() {
  const t = useTranslations("dashboard.content.form");
  const tRoot = useTranslations("dashboard.content");
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  const [clientId, setClientId] = useState("none");
  const [projectId, setProjectId] = useState("none");
  const [contentType, setContentType] = useState("post");
  const [platform, setPlatform] = useState("none");
  const [priority, setPriority] = useState("medium");

  useEffect(() => {
    if (!open) return;

    const load = async () => {
      const supabase = createClient();
      const [clientsRes, projectsRes] = await Promise.all([
        supabase.from("clients").select("id, name").order("name"),
        supabase.from("projects").select("id, name").order("name"),
      ]);
      setClients(clientsRes.data ?? []);
      setProjects(projectsRes.data ?? []);
    };

    load();
  }, [open]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setPending(true);

    const form = new FormData(e.currentTarget);
    const scheduledAt = String(form.get("scheduledAt") ?? "");

    const result = await createContentAction({
      title: String(form.get("title") ?? ""),
      description: String(form.get("description") ?? ""),
      clientId: clientId === "none" ? null : clientId,
      projectId: projectId === "none" ? null : projectId,
      contentType: contentType as never,
      platform: platform === "none" ? null : (platform as never),
      priority: priority as never,
      status: scheduledAt ? "scheduled" : "draft",
      scheduledAt: scheduledAt
        ? new Date(scheduledAt).toISOString()
        : undefined,
    });

    if (!result.success) {
      setError(result.error);
      setPending(false);
      return;
    }

    setPending(false);
    setOpen(false);
    setClientId("none");
    setProjectId("none");
    setContentType("post");
    setPlatform("none");
    setPriority("medium");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-full shadow-lg shadow-primary/30">
          <Plus className="size-4" />
          {t("trigger")}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">{t("titleLabel")} *</Label>
            <Input
              id="title"
              name="title"
              placeholder={t("titlePlaceholder")}
              required
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t("descriptionLabel")}</Label>
            <Textarea
              id="description"
              name="description"
              placeholder={t("descriptionPlaceholder")}
              rows={3}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{t("client")}</Label>
              <Select value={clientId} onValueChange={setClientId}>
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t("noClient")}</SelectItem>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t("project")}</Label>
              <Select value={projectId} onValueChange={setProjectId}>
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t("noProject")}</SelectItem>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{t("type")}</Label>
              <Select value={contentType} onValueChange={setContentType}>
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CONTENT_TYPES.map((ct) => (
                    <SelectItem key={ct} value={ct}>
                      {tRoot(`types.${ct}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t("platform")}</Label>
              <Select value={platform} onValueChange={setPlatform}>
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t("noPlatform")}</SelectItem>
                  {PLATFORMS.map((p) => (
                    <SelectItem key={p} value={p}>
                      {tRoot(`platforms.${p}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{t("priority")}</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map((p) => (
                    <SelectItem key={p} value={p}>
                      {tRoot(`priorities.${p}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="scheduledAt">{t("scheduledAt")}</Label>
              <Input
                id="scheduledAt"
                name="scheduledAt"
                type="datetime-local"
                className="h-11"
                dir="ltr"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={pending}
            >
              {t("cancel")}
            </Button>
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="size-4 animate-spin" />}
              {t("submit")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}