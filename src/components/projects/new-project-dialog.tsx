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
  projectSchema,
  type ProjectFormValues,
} from "@/lib/validations/schemas";
import { toastSuccess, toastError } from "@/lib/actions/toast";
import { createProjectAction } from "@/app/[locale]/dashboard/projects/actions";

type Client = { id: string; name: string; company: string | null };

export function NewProjectDialog({
  projectId: initialProjectId,
}: {
  projectId?: string;
}) {
  const t = useTranslations("dashboard.projects.form");
  const tRoot = useTranslations("dashboard.projects");
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: "",
      description: "",
      clientId: "",
      status: "draft",
      priority: "medium",
      startDate: "",
      endDate: "",
      budget: "",
      currency: "EGP",
    },
  });

  useEffect(() => {
    if (!open) return;
    const load = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("clients")
        .select("id, name, company")
        .order("name");
      setClients(data ?? []);
    };
    load();
  }, [open]);

  const onSubmit = async (data: ProjectFormValues) => {
    setPending(true);
    const result = await createProjectAction({
      name: data.name,
      description: data.description,
      clientId: data.clientId || null,
      status: data.status,
      priority: data.priority,
      startDate: data.startDate,
      endDate: data.endDate,
      budget: data.budget,
      currency: data.currency,
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
            <Label htmlFor="name">{t("name")} *</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder={t("namePlaceholder")}
              className="h-11 rounded-xl"
              aria-invalid={!!errors.name}
            />
            {errors.name && (
              <p className="flex items-center gap-1 text-[11px] text-destructive">
                <AlertCircle className="size-3" />
                {errors.name.message}
              </p>
            )}
          </div>

          {!initialProjectId && (
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
                      {c.company ? ` — ${c.company}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{t("status")}</Label>
              <Select
                value={watch("status")}
                onValueChange={(v) =>
                  setValue("status", v as ProjectFormValues["status"])
                }
              >
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">{tRoot("statuses.draft")}</SelectItem>
                  <SelectItem value="active">{tRoot("statuses.active")}</SelectItem>
                  <SelectItem value="on_hold">{tRoot("statuses.on_hold")}</SelectItem>
                  <SelectItem value="completed">
                    {tRoot("statuses.completed")}
                  </SelectItem>
                  <SelectItem value="cancelled">
                    {tRoot("statuses.cancelled")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t("priority")}</Label>
              <Select
                value={watch("priority")}
                onValueChange={(v) =>
                  setValue("priority", v as ProjectFormValues["priority"])
                }
              >
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">{tRoot("priorities.low")}</SelectItem>
                  <SelectItem value="medium">{tRoot("priorities.medium")}</SelectItem>
                  <SelectItem value="high">{tRoot("priorities.high")}</SelectItem>
                  <SelectItem value="urgent">{tRoot("priorities.urgent")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="startDate">{t("startDate")}</Label>
              <Input
                id="startDate"
                type="date"
                {...register("startDate")}
                className="h-11 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">{t("endDate")}</Label>
              <Input
                id="endDate"
                type="date"
                {...register("endDate")}
                className="h-11 rounded-xl"
                aria-invalid={!!errors.endDate}
              />
              {errors.endDate && (
                <p className="flex items-center gap-1 text-[11px] text-destructive">
                  <AlertCircle className="size-3" />
                  {errors.endDate.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="budget">{t("budget")}</Label>
              <Input
                id="budget"
                type="number"
                min="0"
                step="0.01"
                {...register("budget")}
                placeholder="0"
                className="h-11 rounded-xl"
                aria-invalid={!!errors.budget}
              />
              {errors.budget && (
                <p className="flex items-center gap-1 text-[11px] text-destructive">
                  <AlertCircle className="size-3" />
                  {errors.budget.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>{t("currency")}</Label>
              <Select
                value={watch("currency")}
                onValueChange={(v) =>
                  setValue("currency", v as ProjectFormValues["currency"])
                }
              >
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EGP">EGP</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="SAR">SAR</SelectItem>
                  <SelectItem value="AED">AED</SelectItem>
                </SelectContent>
              </Select>
            </div>
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