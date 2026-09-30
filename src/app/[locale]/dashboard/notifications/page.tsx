import { redirect } from "next/navigation";
import { Bell } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { createClient } from "@/lib/supabase/server";
import { NotificationsList } from "@/components/notifications/notifications-list";

export default async function NotificationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(100);

  const t = await getTranslations("dashboard.notifications");

  return (
    <div className="p-6 md:p-10">
      <div className="flex items-center gap-3">
        <div className="glass flex size-11 items-center justify-center rounded-xl">
          <Bell className="size-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            {t("title")}
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {t("subtitle", { count: notifications?.length ?? 0 })}
          </p>
        </div>
      </div>

      <div className="mt-8">
        <NotificationsList notifications={notifications ?? []} />
      </div>
    </div>
  );
}