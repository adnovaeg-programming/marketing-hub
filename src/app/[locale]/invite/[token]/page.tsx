import { redirect } from "next/navigation";
import { Mail, AlertCircle, Sparkles } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { AuthLayout } from "@/components/auth/auth-layout";
import { Button } from "@/components/ui/button";

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const supabase = await createClient();

  // هل مسجل دخول؟
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // نجيب الدعوة
  const { data: invitation } = await supabase
    .from("workspace_invitations")
    .select(
      `
      id, email, role, status, expires_at,
      workspace:workspaces (id, name, slug)
    `
    )
    .eq("token", token)
    .maybeSingle();

  const t = await getTranslations("dashboard.invite");
  const tRoles = await getTranslations("dashboard.settings.members.roles");

  // دعوة مش موجودة
  if (!invitation) {
    return (
      <AuthLayout>
        <div className="space-y-6 text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="size-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold">{t("invalidTitle")}</h1>
          <p className="text-sm text-muted-foreground">
            {t("invalidDescription")}
          </p>
          <Link
            href="/"
            className="inline-block text-sm font-medium text-primary transition hover:opacity-80"
          >
            {t("backHome")}
          </Link>
        </div>
      </AuthLayout>
    );
  }

  const workspace = Array.isArray(invitation.workspace)
    ? invitation.workspace[0]
    : invitation.workspace;

  // دعوة مستخدمة
  if (invitation.status === "accepted") {
    return (
      <AuthLayout>
        <div className="space-y-6 text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-500/10">
            <Sparkles className="size-8 text-emerald-500" />
          </div>
          <h1 className="text-2xl font-bold">{t("alreadyAcceptedTitle")}</h1>
          <p className="text-sm text-muted-foreground">
            {t("alreadyAcceptedDescription")}
          </p>
          <Button asChild>
            <Link href="/dashboard">{t("goToDashboard")}</Link>
          </Button>
        </div>
      </AuthLayout>
    );
  }

  // دعوة ملغاة أو منتهية
  const isExpired = new Date(invitation.expires_at) < new Date();
  if (invitation.status !== "pending" || isExpired) {
    return (
      <AuthLayout>
        <div className="space-y-6 text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-amber-500/10">
            <AlertCircle className="size-8 text-amber-500" />
          </div>
          <h1 className="text-2xl font-bold">{t("expiredTitle")}</h1>
          <p className="text-sm text-muted-foreground">
            {t("expiredDescription")}
          </p>
          <Link
            href="/"
            className="inline-block text-sm font-medium text-primary transition hover:opacity-80"
          >
            {t("backHome")}
          </Link>
        </div>
      </AuthLayout>
    );
  }

  // الحالة: دعوة صالحة — لكن المستخدم مش مسجل
  if (!user) {
    return (
      <AuthLayout>
        <div className="space-y-6">
          <div className="text-center">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/30">
              <Mail className="size-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              {t("invitedTitle")}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {t("invitedDescription", {
                workspace: workspace?.name ?? "",
                role: tRoles(invitation.role),
              })}
            </p>
          </div>

          <div className="glass rounded-2xl p-4">
            <p className="text-xs text-muted-foreground">
              {t("invitationEmail")}
            </p>
            <p className="mt-1 text-sm font-medium" dir="ltr">
              {invitation.email}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Button asChild size="lg" className="rounded-xl">
              <Link href={`/register?redirect=/invite/${token}`}>
                {t("createAccount")}
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-xl"
            >
              <Link href={`/login?redirect=/invite/${token}`}>
                {t("signIn")}
              </Link>
            </Button>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            {t("note")}
          </p>
        </div>
      </AuthLayout>
    );
  }

  // المستخدم مسجل → نوديه Dashboard تلقائيًا
  // المستخدم مسجل → نوديه على صفحة القبول
  redirect(`/invite/${token}/accept`);
}