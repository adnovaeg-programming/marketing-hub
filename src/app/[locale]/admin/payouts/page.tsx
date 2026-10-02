import { getTranslations } from "next-intl/server";

import { createClient } from "@/lib/supabase/server";
import { AdminPayoutsTable } from "@/components/admin/admin-payouts-table";

export default async function AdminPayoutsPage() {
  const supabase = await createClient();

  const { data: payouts } = await supabase
    .from("payout_requests")
    .select(
      `
      *,
      user:profiles!payout_requests_user_id_fkey (id, first_name, last_name, email),
      method:payout_methods (id, type, label, account_identifier, account_name, bank_name),
      processed_by_profile:profiles!payout_requests_processed_by_fkey (id, first_name, last_name, email)
    `
    )
    .order("requested_at", { ascending: false })
    .limit(200);

  const t = await getTranslations("admin.payouts");

  const normalized = (payouts ?? []).map((p) => ({
    ...p,
    user: Array.isArray(p.user) ? p.user[0] ?? null : p.user,
    method: Array.isArray(p.method) ? p.method[0] ?? null : p.method,
    processed_by_profile: Array.isArray(p.processed_by_profile)
      ? p.processed_by_profile[0] ?? null
      : p.processed_by_profile,
  }));

  return (
    <div className="mx-auto max-w-7xl p-6 md:p-10">
      <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
        {t("title")}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>

      <div className="mt-8">
        <AdminPayoutsTable payouts={normalized} />
      </div>
    </div>
  );
}