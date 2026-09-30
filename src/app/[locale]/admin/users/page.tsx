import { getTranslations } from "next-intl/server";

import { createClient } from "@/lib/supabase/server";
import { UsersTable } from "@/components/admin/users-table";

export default async function AdminUsersPage() {
  const supabase = await createClient();

  const { data: users } = await supabase
    .from("profiles")
    .select(
      "id, email, first_name, last_name, account_type, status, created_at"
    )
    .order("created_at", { ascending: false })
    .limit(200);

  const t = await getTranslations("admin.users");

  return (
    <div className="mx-auto max-w-7xl p-6 md:p-10">
      <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
        {t("title")}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>

      <div className="mt-8">
        <UsersTable users={users ?? []} />
      </div>
    </div>
  );
}