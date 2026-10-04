import {
  TrendingUp,
  Users,
  Wallet,
  FileText,
  Trophy,
  Activity,
} from "lucide-react";

import {
  getKPIsAction,
  getGrowthTimelineAction,
  getTopWorkspacesAction,
  getRevenueBreakdownAction,
  getContentPerformanceAction,
} from "@/lib/admin/analytics-actions";
import { AdminKPIGrid } from "@/components/admin/admin-kpi-grid";
import { LineChart } from "@/components/admin/line-chart";
import { BarChart } from "@/components/analytics/bar-chart";
import { DonutChart } from "@/components/analytics/donut-chart";

export default async function AdminAnalyticsPage() {
  const [kpis, growth, topWorkspaces, revenue, content] = await Promise.all([
    getKPIsAction(),
    getGrowthTimelineAction(30),
    getTopWorkspacesAction(8),
    getRevenueBreakdownAction(),
    getContentPerformanceAction(),
  ]);

  if (!kpis) {
    return (
      <div className="mx-auto max-w-7xl p-6 md:p-10">
        <p className="text-destructive">مش عندك صلاحية لعرض التحليلات</p>
      </div>
    );
  }

  // Growth chart data
  const signupsSeries = growth.map((d) => ({
    label: new Date(d.day).toLocaleDateString(undefined, {
      day: "2-digit",
      month: "short",
    }),
    value: Number(d.signups),
  }));

  const revenueSeries = growth.map((d) => ({
    label: new Date(d.day).toLocaleDateString(undefined, {
      day: "2-digit",
      month: "short",
    }),
    value: Number(d.revenue),
  }));

  // Revenue breakdown bars
  const revenueBars = revenue
    ? [
        {
          label: "عمولة المنصة",
          value: Number(revenue.platform_fees),
          color: "bg-emerald-500",
        },
        {
          label: "إيداعات",
          value: Number(revenue.deposits),
          color: "bg-blue-500",
        },
        {
          label: "سحوبات",
          value: Number(revenue.withdrawals),
          color: "bg-amber-500",
        },
        {
          label: "ضمان محجوز",
          value: Number(revenue.escrow_held),
          color: "bg-purple-500",
        },
        {
          label: "ضمان محرَّر",
          value: Number(revenue.escrow_released),
          color: "bg-primary",
        },
        {
          label: "إيراد معلّق",
          value: Number(revenue.pending_revenue),
          color: "bg-accent",
        },
      ].filter((b) => b.value > 0)
    : [];

  // Content donut
  const donutColors: Record<string, string> = {
    draft: "#94a3b8",
    internal_review: "#3b82f6",
    client_review: "#f59e0b",
    approved: "#10b981",
    rejected: "#ef4444",
    scheduled: "#a855f7",
    published: "#8b5cf6",
    archived: "#64748b",
  };

  const contentLabels: Record<string, string> = {
    draft: "مسودة",
    internal_review: "مراجعة داخلية",
    client_review: "مراجعة عميل",
    approved: "معتمد",
    rejected: "مرفوض",
    scheduled: "مجدول",
    published: "منشور",
    archived: "مؤرشف",
  };

  const donutSegments = content
    ? Object.entries(content)
        .filter(([_, v]) => v > 0)
        .map(([k, v]) => ({
          label: contentLabels[k] ?? k,
          value: v,
          color: donutColors[k] ?? "#94a3b8",
        }))
    : [];

  return (
    <div className="mx-auto max-w-7xl p-6 md:p-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          تحليلات المنصة
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          نظرة شاملة على أداء المنصة — KPIs، نمو، إيرادات، وأفضل المستخدمين
        </p>
      </div>

      {/* KPIs Grid */}
      <AdminKPIGrid kpis={kpis} />

      {/* Growth Charts */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="glass-strong glass-reflect rounded-3xl p-6 md:p-8">
          <div className="mb-6 flex items-center gap-2">
            <Users className="size-5 text-primary" />
            <div>
              <h2 className="text-lg font-semibold">نمو المستخدمين</h2>
              <p className="text-xs text-muted-foreground">
                آخر 30 يوم • {signupsSeries.reduce((s, d) => s + d.value, 0)} تسجيل جديد
              </p>
            </div>
          </div>
          <LineChart
            data={signupsSeries}
            color="var(--primary)"
            height={220}
          />
        </div>

        <div className="glass-strong glass-reflect rounded-3xl p-6 md:p-8">
          <div className="mb-6 flex items-center gap-2">
            <TrendingUp className="size-5 text-accent" />
            <div>
              <h2 className="text-lg font-semibold">الإيرادات</h2>
              <p className="text-xs text-muted-foreground">
                آخر 30 يوم • {revenueSeries.reduce((s, d) => s + d.value, 0).toLocaleString()} EGP
              </p>
            </div>
          </div>
          <LineChart
            data={revenueSeries}
            color="var(--accent)"
            height={220}
          />
        </div>
      </div>

      {/* Revenue + Content */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="glass-strong rounded-3xl p-6 md:p-8">
          <div className="mb-6 flex items-center gap-2">
            <Wallet className="size-5 text-emerald-500" />
            <h2 className="text-lg font-semibold">توزيع الإيرادات</h2>
          </div>
          {revenueBars.length > 0 ? (
            <BarChart data={revenueBars} />
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Wallet className="size-10 text-muted-foreground/30" />
              <p className="mt-3 text-sm text-muted-foreground">
                مفيش إيرادات لسه
              </p>
            </div>
          )}
        </div>

        <div className="glass-strong rounded-3xl p-6 md:p-8">
          <div className="mb-6 flex items-center gap-2">
            <FileText className="size-5 text-primary" />
            <h2 className="text-lg font-semibold">توزيع المحتوى</h2>
          </div>
          <DonutChart
            segments={donutSegments}
            centerLabel="قطعة"
            centerValue={kpis.total_content}
          />
        </div>
      </div>

      {/* Top Workspaces */}
      <div className="mt-8">
        <div className="glass-strong rounded-3xl p-6 md:p-8">
          <div className="mb-6 flex items-center gap-2">
            <Trophy className="size-5 text-amber-500" />
            <h2 className="text-lg font-semibold">أفضل مساحات العمل</h2>
          </div>

          {topWorkspaces.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Activity className="size-10 text-muted-foreground/30" />
              <p className="mt-3 text-sm text-muted-foreground">
                مفيش مساحات عمل لسه
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {topWorkspaces.map((ws, index) => (
                <div
                  key={ws.workspace_id}
                  className="glass flex flex-col gap-4 rounded-2xl p-4 lg:flex-row lg:items-center"
                >
                  {/* Rank */}
                  <div
                    className={`flex size-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${
                      index === 0
                        ? "bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-lg shadow-amber-500/30"
                        : index === 1
                          ? "bg-gradient-to-br from-slate-300 to-slate-500 text-white"
                          : index === 2
                            ? "bg-gradient-to-br from-orange-400 to-orange-600 text-white"
                            : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {index + 1}
                  </div>

                  {/* Name */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{ws.workspace_name}</p>
                    {ws.organization_name && (
                      <p className="truncate text-xs text-muted-foreground">
                        {ws.organization_name}
                      </p>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-4 gap-4 text-center lg:gap-6">
                    <div>
                      <p className="text-[10px] text-muted-foreground">عملاء</p>
                      <p className="text-sm font-bold">{ws.clients_count}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground">مشاريع</p>
                      <p className="text-sm font-bold">{ws.projects_count}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground">محتوى</p>
                      <p className="text-sm font-bold">{ws.content_count}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground">مهام</p>
                      <p className="text-sm font-bold">{ws.tasks_count}</p>
                    </div>
                  </div>

                  {/* Activity Score */}
                  <div className="shrink-0 text-end lg:w-32">
                    <p className="text-[10px] text-muted-foreground">
                      مؤشر النشاط
                    </p>
                    <p className="text-lg font-bold text-primary">
                      {ws.activity_score}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Platform Health */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="glass rounded-2xl p-5">
          <p className="text-xs text-muted-foreground">مستخدمين اليوم</p>
          <p className="mt-2 text-2xl font-bold text-emerald-500">
            +{kpis.new_users_today}
          </p>
        </div>
        <div className="glass rounded-2xl p-5">
          <p className="text-xs text-muted-foreground">آخر 7 أيام</p>
          <p className="mt-2 text-2xl font-bold">+{kpis.new_users_7d}</p>
        </div>
        <div className="glass rounded-2xl p-5">
          <p className="text-xs text-muted-foreground">عقود نشطة</p>
          <p className="mt-2 text-2xl font-bold">{kpis.active_contracts}</p>
        </div>
        <div className="glass rounded-2xl p-5">
          <p className="text-xs text-muted-foreground">منشورات ناجحة</p>
          <p className="mt-2 text-2xl font-bold text-primary">
            {kpis.published_posts}
          </p>
        </div>
      </div>
    </div>
  );
}