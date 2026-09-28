import {
  User,
  FolderKanban,
  FileText,
  CheckSquare,
  Sparkles,
  Bell,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";

type Activity = {
  id: string;
  type: "client" | "project" | "content" | "task" | "notification";
  title: string;
  subtitle?: string | null;
  href: string;
  created_at: string;
};

const TYPE_CONFIG: Record<
  Activity["type"],
  { icon: typeof User; color: string; bg: string }
> = {
  client: {
    icon: User,
    color: "text-primary",
    bg: "bg-primary/10",
  },
  project: {
    icon: FolderKanban,
    color: "text-accent",
    bg: "bg-accent/10",
  },
  content: {
    icon: FileText,
    color: "text-primary",
    bg: "bg-primary/10",
  },
  task: {
    icon: CheckSquare,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  notification: {
    icon: Bell,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
};

export function ActivityFeed({
  activities,
}: {
  activities: Activity[];
}) {
  const t = useTranslations("dashboard.analytics.activity");

  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Sparkles className="size-8 text-muted-foreground/40" />
        <p className="mt-3 text-sm text-muted-foreground">{t("empty")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {activities.map((activity) => {
        const config = TYPE_CONFIG[activity.type];
        const Icon = config.icon;

        return (
          <Link
            key={`${activity.type}-${activity.id}`}
            href={activity.href}
            className="glass flex items-start gap-3 rounded-xl p-3 transition-transform hover:-translate-y-0.5"
          >
            <div
              className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${config.bg}`}
            >
              <Icon className={`size-4 ${config.color}`} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{activity.title}</p>
              {activity.subtitle && (
                <p className="truncate text-xs text-muted-foreground">
                  {activity.subtitle}
                </p>
              )}
              <p className="mt-0.5 text-[10px] text-muted-foreground/70">
                {new Date(activity.created_at).toLocaleString()}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}