"use client";

import { useState } from "react";
import { Loader2, Check, AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateProfileAction } from "@/app/[locale]/dashboard/settings/actions";

type Profile = {
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  job_title: string | null;
  bio: string | null;
  country: string | null;
  city: string | null;
  timezone: string | null;
  language: string | null;
};

export function ProfileForm({ profile }: { profile: Profile | null }) {
  const t = useTranslations("dashboard.settings.profile");
  const [pending, setPending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [timezone, setTimezone] = useState(profile?.timezone ?? "Africa/Cairo");
  const [language, setLanguage] = useState(profile?.language ?? "ar");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setPending(true);

    const form = new FormData(e.currentTarget);
    const result = await updateProfileAction({
      firstName: String(form.get("firstName") ?? ""),
      lastName: String(form.get("lastName") ?? ""),
      phone: String(form.get("phone") ?? ""),
      jobTitle: String(form.get("jobTitle") ?? ""),
      bio: String(form.get("bio") ?? ""),
      country: String(form.get("country") ?? ""),
      city: String(form.get("city") ?? ""),
      timezone,
      language: language as "ar" | "en",
    });

    setPending(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="glass-strong rounded-3xl p-6 md:p-8">
      <div className="mb-6">
        <h2 className="text-xl font-semibold">{t("title")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("description")}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="firstName">{t("firstName")} *</Label>
            <Input
              id="firstName"
              name="firstName"
              defaultValue={profile?.first_name ?? ""}
              required
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">{t("lastName")}</Label>
            <Input
              id="lastName"
              name="lastName"
              defaultValue={profile?.last_name ?? ""}
              className="h-11"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="phone">{t("phone")}</Label>
            <Input
              id="phone"
              name="phone"
              defaultValue={profile?.phone ?? ""}
              placeholder="+20 100 000 0000"
              className="h-11"
              dir="ltr"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="jobTitle">{t("jobTitle")}</Label>
            <Input
              id="jobTitle"
              name="jobTitle"
              defaultValue={profile?.job_title ?? ""}
              placeholder={t("jobTitlePlaceholder")}
              className="h-11"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">{t("bio")}</Label>
          <Textarea
            id="bio"
            name="bio"
            defaultValue={profile?.bio ?? ""}
            placeholder={t("bioPlaceholder")}
            rows={3}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="country">{t("country")}</Label>
            <Input
              id="country"
              name="country"
              defaultValue={profile?.country ?? ""}
              placeholder={t("countryPlaceholder")}
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">{t("city")}</Label>
            <Input
              id="city"
              name="city"
              defaultValue={profile?.city ?? ""}
              placeholder={t("cityPlaceholder")}
              className="h-11"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>{t("timezone")}</Label>
            <Select value={timezone} onValueChange={setTimezone}>
              <SelectTrigger className="h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Africa/Cairo">Cairo (GMT+2)</SelectItem>
                <SelectItem value="Asia/Riyadh">Riyadh (GMT+3)</SelectItem>
                <SelectItem value="Asia/Dubai">Dubai (GMT+4)</SelectItem>
                <SelectItem value="Europe/London">London (GMT+0)</SelectItem>
                <SelectItem value="America/New_York">New York (GMT-5)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{t("language")}</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ar">العربية</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-start gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-600 dark:text-emerald-400">
            <Check className="mt-0.5 size-4 shrink-0" />
            <span>{t("success")}</span>
          </div>
        )}

        <div className="flex justify-end">
          <Button type="submit" disabled={pending} className="rounded-full px-6">
            {pending && <Loader2 className="size-4 animate-spin" />}
            {t("submit")}
          </Button>
        </div>
      </form>
    </div>
  );
}