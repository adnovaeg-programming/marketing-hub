"use client";

import { useState } from "react";
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
import {
  clientSchema,
  type ClientFormValues,
} from "@/lib/validations/schemas";
import { toastSuccess, toastError } from "@/lib/actions/toast";
import { createClientAction } from "@/app/[locale]/dashboard/clients/actions";

export function NewClientDialog() {
  const t = useTranslations("dashboard.clients.form");
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      company: "",
      industry: "",
      website: "",
      status: "active",
      notes: "",
    },
  });

  const statusValue = watch("status");

  const onSubmit = async (data: ClientFormValues) => {
    setPending(true);
    const result = await createClientAction(data);
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
        <Button className="rounded-full bg-gradient-to-r from-primary to-accent shadow-lg shadow-primary/30 transition-shadow hover:shadow-xl hover:shadow-primary/40">
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
          {/* Name */}
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

          {/* Email + Phone */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email">{t("email")}</Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                placeholder={t("emailPlaceholder")}
                className="h-11 rounded-xl"
                aria-invalid={!!errors.email}
              />
              {errors.email && (
                <p className="flex items-center gap-1 text-[11px] text-destructive">
                  <AlertCircle className="size-3" />
                  {errors.email.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">{t("phone")}</Label>
              <Input
                id="phone"
                {...register("phone")}
                placeholder={t("phonePlaceholder")}
                className="h-11 rounded-xl"
              />
            </div>
          </div>

          {/* Company + Industry */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="company">{t("company")}</Label>
              <Input
                id="company"
                {...register("company")}
                placeholder={t("companyPlaceholder")}
                className="h-11 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="industry">{t("industry")}</Label>
              <Input
                id="industry"
                {...register("industry")}
                placeholder={t("industryPlaceholder")}
                className="h-11 rounded-xl"
              />
            </div>
          </div>

          {/* Website */}
          <div className="space-y-2">
            <Label htmlFor="website">{t("website")}</Label>
            <Input
              id="website"
              {...register("website")}
              placeholder={t("websitePlaceholder")}
              className="h-11 rounded-xl"
              aria-invalid={!!errors.website}
            />
            {errors.website && (
              <p className="flex items-center gap-1 text-[11px] text-destructive">
                <AlertCircle className="size-3" />
                {errors.website.message}
              </p>
            )}
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label>{t("status")}</Label>
            <Select
              value={statusValue}
              onValueChange={(v) =>
                setValue("status", v as ClientFormValues["status"])
              }
            >
              <SelectTrigger className="h-11 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">{t("statusActive")}</SelectItem>
                <SelectItem value="lead">{t("statusLead")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">{t("notes")}</Label>
            <Textarea
              id="notes"
              {...register("notes")}
              placeholder={t("notesPlaceholder")}
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