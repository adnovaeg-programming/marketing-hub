import Link from "next/link";
import { Mail, Phone, Building2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { DeleteClientButton } from "./delete-client-button";

type Client = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  status: string;
};

export function ClientCard({ client }: { client: Client }) {
  const t = useTranslations("dashboard.clients");

  const statusStyles: Record<string, string> = {
    active: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    lead: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    archived: "bg-muted text-muted-foreground",
  };

  return (
    <div className="glass glass-hover group relative rounded-2xl">
      {/* Link يغطي كل الكارت ما عدا زر الحذف */}
      <Link
        href={`/dashboard/clients/${client.id}`}
        className="block p-5"
        aria-label={client.name}
      >
        {/* Status + Spacer لزر الحذف */}
        <div className="flex items-start justify-between gap-2">
          <div
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
              statusStyles[client.status] ?? statusStyles.archived
            }`}
          >
            {t(`statuses.${client.status}`)}
          </div>
          {/* مساحة فاضية عشان زر الحذف */}
          <div className="size-8" aria-hidden />
        </div>

        {/* Avatar + Name */}
        <div className="mt-3 flex items-center gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-base font-bold text-white shadow-lg shadow-primary/30">
            {client.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h3 className="truncate font-semibold">{client.name}</h3>
            {client.company && (
              <p className="truncate text-xs text-muted-foreground">
                {client.company}
              </p>
            )}
          </div>
        </div>

        {/* Contact */}
        <div className="mt-4 space-y-2 border-t border-border/40 pt-4 text-xs">
          {client.email ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="size-3.5 shrink-0" />
              <span className="truncate">{client.email}</span>
            </div>
          ) : null}
          {client.phone ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="size-3.5 shrink-0" />
              <span className="truncate" dir="ltr">
                {client.phone}
              </span>
            </div>
          ) : null}
          {!client.email && !client.phone ? (
            <div className="flex items-center gap-2 text-muted-foreground/60">
              <Building2 className="size-3.5 shrink-0" />
              <span>{t("noContact")}</span>
            </div>
          ) : null}
        </div>
      </Link>

      {/* Delete Button — فوق الزر، مش جوه الـ Link */}
      <div className="absolute end-3 top-3 opacity-0 transition-opacity group-hover:opacity-100">
        <DeleteClientButton clientId={client.id} />
      </div>
    </div>
  );
}