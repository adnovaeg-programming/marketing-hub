import { Link } from "@/i18n/navigation";
import { Mail, Phone, Building2, ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";

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
    active:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    lead:
      "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    archived: "bg-muted text-muted-foreground border-border/40",
  };

  // Generate initials
  const initials = client.name
    .split(" ")
    .map((w) => w.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <Link
      href={`/dashboard/clients/${client.id}`}
      className="glass glass-reflect group relative block overflow-hidden rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10"
    >
      {/* Header: Status + Arrow */}
      <div className="flex items-start justify-between gap-3">
        <span
          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-medium ${
            statusStyles[client.status] ?? statusStyles.archived
          }`}
        >
          {t(`statuses.${client.status}`)}
        </span>

        <ArrowLeft className="size-4 shrink-0 text-muted-foreground opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
      </div>

      {/* Avatar + Name */}
      <div className="mt-4 flex items-center gap-3">
        <div className="relative flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent text-sm font-bold text-white shadow-lg shadow-primary/30">
          {initials}
        </div>
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold">{client.name}</h3>
          {client.company && (
            <p className="truncate text-xs text-muted-foreground">
              {client.company}
            </p>
          )}
        </div>
      </div>

      {/* Contact info */}
      <div className="mt-4 space-y-2 border-t border-border/40 pt-4 text-xs">
        {client.email ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Mail className="size-3.5 shrink-0" />
            <span className="truncate" dir="ltr">
              {client.email}
            </span>
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
  );
}