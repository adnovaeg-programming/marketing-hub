"use client";

import { useState, useMemo, useDeferredValue } from "react";
import { Users, Search, Filter, Plus } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NewClientDialog } from "@/components/clients/new-client-dialog";
import { ClientCard } from "@/components/clients/client-card";

type Client = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  industry: string | null;
  status: string;
  created_at: string;
};

type StatusFilter = "all" | "active" | "lead" | "archived";

export function ClientsGrid({ clients }: { clients: Client[] }) {
  const t = useTranslations("dashboard.clients");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const deferredQuery = useDeferredValue(query);

  const filtered = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();

    return clients.filter((c) => {
      // Status filter
      if (statusFilter !== "all" && c.status !== statusFilter) return false;

      // Search
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.company?.toLowerCase().includes(q) ||
        c.industry?.toLowerCase().includes(q)
      );
    });
  }, [clients, deferredQuery, statusFilter]);

  const statuses: { key: StatusFilter; label: string }[] = [
    { key: "all", label: t("filters.all") },
    { key: "active", label: t("statuses.active") },
    { key: "lead", label: t("statuses.lead") },
    { key: "archived", label: t("statuses.archived") },
  ];

  // Empty state (no clients at all)
  if (clients.length === 0) {
    return (
      <div className="mt-12 flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/60 bg-card/30 py-20 text-center">
        <div className="glass flex size-16 items-center justify-center rounded-2xl">
          <Users className="size-8 text-primary" />
        </div>
        <h2 className="mt-4 text-lg font-semibold">{t("emptyTitle")}</h2>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          {t("emptyDescription")}
        </p>
        <div className="mt-6">
          <NewClientDialog />
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Toolbar: Search + Filter + New */}
      <div className="mt-8 flex flex-col gap-3 md:flex-row md:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="glass h-11 rounded-xl ps-10"
          />
        </div>

        {/* Filter (desktop) */}
        <div className="hidden items-center gap-1.5 rounded-xl glass p-1 md:flex">
          {statuses.map((s) => (
            <button
              key={s.key}
              onClick={() => setStatusFilter(s.key)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                statusFilter === s.key
                  ? "bg-gradient-to-r from-primary to-accent text-white shadow-md shadow-primary/30"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* New client button */}
        <div className="md:shrink-0">
          <NewClientDialog />
        </div>
      </div>

      {/* Mobile filter (horizontal scroll) */}
      <div className="mt-3 flex gap-2 overflow-x-auto pb-1 md:hidden">
        {statuses.map((s) => (
          <button
            key={s.key}
            onClick={() => setStatusFilter(s.key)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition ${
              statusFilter === s.key
                ? "bg-gradient-to-r from-primary to-accent text-white shadow-md shadow-primary/30"
                : "glass text-muted-foreground"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Results counter */}
      {(query || statusFilter !== "all") && (
        <p className="mt-4 text-xs text-muted-foreground">
          {t("resultsCount", { count: filtered.length })}
        </p>
      )}

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="mt-8 flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/60 bg-card/30 py-16 text-center">
          <Search className="size-8 text-muted-foreground/40" />
          <p className="mt-3 text-sm text-muted-foreground">
            {t("noResults")}
          </p>
          <button
            onClick={() => {
              setQuery("");
              setStatusFilter("all");
            }}
            className="mt-3 text-xs font-medium text-primary hover:opacity-80"
          >
            {t("clearFilters")}
          </button>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((client) => (
            <ClientCard key={client.id} client={client} />
          ))}
        </div>
      )}
    </>
  );
}