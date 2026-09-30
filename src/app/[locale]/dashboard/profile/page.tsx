import { redirect } from "next/navigation";
import { UserCircle, Mail, Shield } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "@/components/settings/profile-form";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, last_name, phone, job_title, bio, country, city, timezone, language, account_type, created_at")
    .eq("id", user.id)
    .single();

  const t = await getTranslations("dashboard.profile");

  const displayName =
    [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") ||
    user.email;

  const initial = (profile?.first_name?.charAt(0) || user.email?.charAt(0) || "?").toUpperCase();

  const joinedAt = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString()
    : "—";

  return (
    <div className="p-6 md:p-10">
      {/* Hero Card */}
      <div className="glass-strong glass-reflect relative overflow-hidden rounded-3xl p-6 md:p-8">
        <div className="pointer-events-none absolute -right-20 -top-20 size-64 animate-glow-pulse rounded-full bg-primary/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 size-64 animate-glow-pulse rounded-full bg-accent/15 blur-3xl" style={{ animationDelay: "2s" }} />

        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="relative flex size-20 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br from-primary to-accent text-3xl font-bold text-white shadow-2xl shadow-primary/40">
              {initial}
              <span className="animate-pulse-ring absolute inset-0 rounded-3xl border-2 border-primary/40" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                {displayName}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <Mail className="size-3.5" />
                  <span dir="ltr">{user.email}</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Shield className="size-3.5" />
                  {profile?.account_type ?? "—"}
                </span>
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl px-4 py-3 text-center md:text-end">
            <p className="text-[10px] text-muted-foreground">{t("joinedOn")}</p>
            <p className="mt-1 text-sm font-semibold">{joinedAt}</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="mt-8">
        <ProfileForm profile={profile} />
      </div>
    </div>
  );
}