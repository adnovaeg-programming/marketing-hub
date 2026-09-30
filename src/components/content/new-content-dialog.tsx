"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import {
  contentSchema,
  type ContentFormValues,
} from "@/lib/validations/schemas";
import { toastSuccess, toastError } from "@/lib/actions/toast";
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

export function NewContentDialog() {
  const t = useTranslations("dashboard.content.form");
  const tRoot = useTranslations("dashboard.content");
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<ContentFormValues>({
    resolver: zodResolver(contentSchema),
    defaultValues: {
      title: "",
      description: "",
      clientId: "",
      projectId: "",
      contentType: "post",
      platform: undefined,
      priority: "medium",
      scheduledAt: "",
    },
  });

  useEffect(() => {
    if (!open) return;
    const load = async () => {
      const supabase = createClient();
      const [c, p] = await Promise.all([
        supabase.from("clients").select("id, name").order("name"),
        supabase.from("projects").select("id, name").order("name"),
      ]);
      setClients(c.data ?? []);
      setProjects(p.data ?? []);
    };
    load();
  }, [open]);

  const onSubmit = async (data: ContentFormValues) => {
    setPending(true);

    const scheduledISO = data.scheduledAt
      ? new Date(data.scheduledAt).toISOString()
      : undefined;

    const result = await createContentAction({
      title: data.title,
      description: data.description,
      clientId: data.clientId || null,
      projectId: data.projectId || null,
      contentType: data.contentType,
      platform: data.platform ?? null,
      priority: data.priority,
      scheduledAt: scheduledISO,
      status: scheduledISO ? "scheduled" : "draft",
    });
    setPending(false);

    if (!result.success) {
      toastError(result.error, t("errors.generic"));
      return;
    }

    toastSuccess(t("success"), t("successDescription"));
    reset();
    setOpen(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button className="rounded-full bg-gradient-to-r from-primary to-accent shadow-lg shadow-primary/30">
          <Plus className="size-4" />
          {t("trigger")}
        </Button>
      </DialogTrigger>

      <DialogContent className="glass-strong max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">{t("titleLabel")} *</Label>
            <Input
              id="title"
              {...register("title")}
              placeholder={t("titlePlaceholder")}
              className="h-11 rounded-xl"
              aria-invalid={!!errors.title}
            />
            {errors.title && (
              <p className="flex items-center gap-1 text-[11px] text-destructive">
                <AlertCircle className="size-3" />
                {errors.title.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t("descriptionLabel")}</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder={t("descriptionPlaceholder")}
              rows={3}
              className="rounded-xl"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{t("client")}</Label>
              <Select
                value={watch("clientId") || "none"}
                onValueChange={(v) =>
                  setValue("clientId", v === "none" ? "" : v)
                }
              >
                <SelectTrigger className="h-11 rounded-xl">
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
              <Select
                value={watch("projectId") || "none"}
                onValueChange={(v) =>
                  setValue("projectId", v === "none" ? "" : v)
                }
              >
                <SelectTrigger className="h-11 rounded-xl">
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
              <Select
                value={watch("contentType")}
                onValueChange={(v) =>
                  setValue("contentType", v as ContentFormValues["contentType"])
                }
              >
                <SelectTrigger className="h-11 rounded-xl">
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
              <Select
                value={watch("platform") || "none"}
                onValueChange={(v) =>
                  setValue(
                    "platform",
                    v === "none" ? undefined : (v as ContentFormValues["platform"])
                  )
                }
              >
                <SelectTrigger className="h-11 rounded-xl">
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
              <Select
                value={watch("priority")}
                onValueChange={(v) =>
                  setValue("priority", v as ContentFormValues["priority"])
                }
              >
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(["low", "medium", "high", "urgent"] as const).map((p) => (
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
                type="datetime-local"
                {...register("scheduledAt")}
                className="h-11 rounded-xl"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={pending}
              className="rounded-xl"
            >
              {t("cancel")}
            </Button>
            <Button
              type="submit"
              disabled={pending}
              className="rounded-xl bg-gradient-to-r from-primary to-accent"
            >
              {pending && <Loader2 className="size-4 animate-spin" />}
              {t("submit")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}