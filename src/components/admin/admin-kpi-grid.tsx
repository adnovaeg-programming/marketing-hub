import {
  Users,
  Briefcase,
  FileText,
  Wallet,
  TrendingUp,
  Building2,
  ShoppingBag,
  Share2,
} from "lucide-react";

import { CountUp } from "@/components/fx/count-up";

type KPIs = {
  total_users: number;
  total_workspaces: number;
  total_clients: number;
  total_projects: number;
  total_content: number;
  total_contracts_value: number;
  total_platform_fees: number;
  wallet_total_balance: number;
  total_marketplace_listings: number;
  active_social_accounts: number;
};

export function AdminKPIGrid({ kpis }: { kpis: KPIs }) {
  const items = [
    {
      icon: Users,
      label: "إجمالي المستخدمين",
      value: kpis.total_users,
      color: "text-primary",
      bg: "from-primary/20 to-accent/20",
    },
    {
      icon: Building2,
      label: "مساحات العمل",
      value: kpis.total_workspaces,
      color: "text-accent",
      bg: "from-accent/20 to-primary/20",
    },
    {
      icon: Briefcase,
      label: "العملاء",
      value: kpis.total_clients,
      color: "text-primary",
      bg: "from-primary/20 to-accent/20",
    },
    {
      icon: FileText,
      label: "قطعة محتوى",
      value: kpis.total_content,
      color: "text-accent",
      bg: "from-accent/20 to-primary/20",
    },
    {
      icon: Wallet,
      label: "إجمالي العقود (EGP)",
      value: Math.round(kpis.total_contracts_value),
      color: "text-emerald-500",
      bg: "from-emerald-500/20 to-primary/20",
    },
    {
      icon: TrendingUp,
      label: "عمولة المنصة (EGP)",
      value: Math.round(kpis.total_platform_fees),
      color: "text-emerald-500",
      bg: "from-emerald-500/20 to-accent/20",
    },
    {
      icon: ShoppingBag,
      label: "خدمات في السوق",
      value: kpis.total_marketplace_listings,
      color: "text-purple-500",
      bg: "from-purple-500/20 to-primary/20",
    },
    {
      icon: Share2,
      label: "حسابات سوشيال",
      value: kpis.active_social_accounts,
      color: "text-blue-500",
      bg: "from-blue-500/20 to-accent/20",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.label}
            className="glass glass-hover rounded-2xl p-5 transition-all hover:-translate-y-0.5"
          >
            <div
              className={`inline-flex size-10 items-center justify-center rounded-xl bg-gradient-to-br ${item.bg}`}
            >
              <Icon className={`size-5 ${item.color}`} />
            </div>
            <p className="mt-4 text-xs font-medium text-muted-foreground">
              {item.label}
            </p>
            <p className="mt-1 text-3xl font-bold tracking-tight">
              <CountUp end={item.value} duration={1400} />
            </p>
          </div>
        );
      })}
    </div>
  );
}