"use client";

import {
  LayoutDashboard,
  Users,
  Building2,
  ScrollText,
  Settings,
  Wallet,
  BarChart3,  // ← ضيف
} from "lucide-react";
import { useTranslations } from "next-intl";

import { Link, usePathname } from "@/i18n/navigation";

const NAV = [
  { href: "/admin", icon: LayoutDashboard, key: "overview" },
  { href: "/admin/analytics", icon: BarChart3, key: "analytics" },  // ← ضيف
  { href: "/admin/users", icon: Users, key: "users" },
  { href: "/admin/workspaces", icon: Building2, key: "workspaces" },
  { href: "/admin/payouts", icon: Wallet, key: "payouts" },
  { href: "/admin/audit", icon: ScrollText, key: "audit" },
  { href: "/admin/settings", icon: Settings, key: "settings" },
] as const;

export function AdminNav() {
  const t = useTranslations("admin.nav");
  const pathname = usePathname();

  return (
    <nav className="glass border-b border-glass-border">
      <div className="mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto px-4 py-2 md:px-8">
        {NAV.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname?.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-all ${
                isActive
                  ? "bg-gradient-to-r from-primary/15 to-accent/10 text-primary"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              <Icon className="size-4" />
              {t(item.key)}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}