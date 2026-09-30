"use client";

import { useState, useMemo, useDeferredValue, useTransition } from "react";
import {
  Search,
  Ban,
  RotateCcw,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  suspendUserAction,
  restoreUserAction,
} from "@/app/[locale]/admin/actions";

type User = {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  account_type: string | null;
  status: string;
  created_at: string;
};

export function UsersTable({ users }: { users: User[] }) {
  const t = useTranslations("admin.users");
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [pending, startTransition] = useTransition();
  const [actionUser, setActionUser] = useState<string | null>(null);
  const deferredQuery = useDeferredValue(query);

  const filtered = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.email.toLowerCase().includes(q) ||
        u.first_name?.toLowerCase().includes(q) ||
        u.last_name?.toLowerCase().includes(q)
    );
  }, [users, deferredQuery]);

  const handleSuspend = (userId: string) => {
    if (!confirm(t("confirmSuspend"))) return;
    setActionUser(userId);

    startTransition(async () => {
      const result = await suspendUserAction(userId);
      setActionUser(null);
      if (!result.success) {
        toast.error("فشل الإجراء");
        return;
      }
      toast.success("تم تعليق الحساب");
      router.refresh();
    });
  };

  const handleRestore = (userId: string) => {
    setActionUser(userId);

    startTransition(async () => {
      const result = await restoreUserAction(userId);
      setActionUser(null);
      if (!result.success) {
        toast.error("فشل الإجراء");
        return;
      }
      toast.success("تم استرجاع الحساب");
      router.refresh();
    });
  };

  return (
    <>
      <div className="relative max-w-md">
        <Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("searchPlaceholder")}
          className="glass h-11 rounded-xl ps-10"
        />
      </div>

      <div className="glass-strong mt-6 overflow-hidden rounded-3xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border/40 bg-muted/30">
              <tr className="text-xs text-muted-foreground">
                <th className="p-3 text-start">{t("cols.name")}</th>
                <th className="p-3 text-start">{t("cols.email")}</th>
                <th className="p-3 text-start">{t("cols.type")}</th>
                <th className="p-3 text-start">{t("cols.status")}</th>
                <th className="p-3 text-end">{t("cols.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => {
                const name =
                  [u.first_name, u.last_name].filter(Boolean).join(" ") ||
                  u.email;
                const initial = name.charAt(0).toUpperCase();
                const isSuspended = u.status === "suspended";

                return (
                  <tr
                    key={u.id}
                    className="border-b border-border/20 transition hover:bg-muted/30"
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent text-xs font-bold text-white">
                          {initial}
                        </div>
                        <span className="text-sm font-medium">{name}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="text-xs text-muted-foreground" dir="ltr">
                        {u.email}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="rounded-full bg-muted/60 px-2 py-0.5 text-[10px] font-medium capitalize">
                        {u.account_type ?? "—"}
                      </span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-medium ${
                          isSuspended
                            ? "bg-destructive/10 text-destructive"
                            : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        }`}
                      >
                        {isSuspended ? (
                          <>
                            <Ban className="size-3" />
                            {t("status.suspended")}
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="size-3" />
                            {t("status.active")}
                          </>
                        )}
                      </span>
                    </td>
                    <td className="p-3 text-end">
                      {isSuspended ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRestore(u.id)}
                          disabled={actionUser === u.id || pending}
                          className="rounded-full text-xs"
                        >
                          {actionUser === u.id ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            <RotateCcw className="size-3.5" />
                          )}
                          {t("restore")}
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleSuspend(u.id)}
                          disabled={actionUser === u.id || pending}
                          className="rounded-full text-xs text-destructive hover:bg-destructive/10"
                        >
                          {actionUser === u.id ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            <Ban className="size-3.5" />
                          )}
                          {t("suspend")}
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}