import { getTranslations } from "next-intl/server";

import { createClient } from "@/lib/supabase/server";
import { AuditLogTable } from "@/components/admin/audit-log-table";

export default async function AdminAuditPage() {
  const supabase = await createClient();

  const { data: logs } = await supabase
    .from("audit_logs")
    .select(
      `id, action, entity_type, entity_id, entity_name, severity, actor_email, metadata, created_at`
    )
    .order("created_at", { ascending: false })
    .limit(200);

  const t = await getTranslations("admin.audit");

  return (
    <div className="mx-auto max-w-7xl p-6 md:p-10">
      <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
        {t("title")}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>

      <div className="mt-8">
        <AuditLogTable
          logs={
            (logs ?? []) as {
              id: string;
              action: string;
              entity_type: string | null;
              entity_id: string | null;
              entity_name: string | null;
              severity: string;
              actor_email: string | null;
              metadata: unknown;
              created_at: string;
            }[]
          }
        />
      </div>
    </div>
  );
}