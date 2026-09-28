"use client";

import { useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
} from "lucide-react";
import { useTranslations, useLocale } from "next-intl";

import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

type ContentItem = {
  id: string;
  title: string;
  status: string;
  platform: string | null;
  content_type: string;
  scheduled_at: string | null;
  client: { id: string; name: string } | null;
};

const PLATFORM_COLORS: Record<string, string> = {
  instagram: "bg-gradient-to-br from-pink-500 to-purple-600",
  facebook: "bg-blue-600",
  tiktok: "bg-black",
  x: "bg-black",
  linkedin: "bg-[#0A66C2]",
  youtube: "bg-red-600",
};

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-muted-foreground/40",
  internal_review: "bg-blue-500",
  client_review: "bg-amber-500",
  approved: "bg-emerald-500",
  rejected: "bg-destructive",
  scheduled: "bg-purple-500",
  published: "bg-primary",
  archived: "bg-muted-foreground/40",
};

function getMonthDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // أيام الأسبوع: في RTL العربي، أول يوم أحد، في الإنجليزي ممكن الإثنين
  // نخلي أول يوم في الأسبوع الأحد (شائع في المنطقة العربية)
  const startWeekDay = firstDay.getDay(); // 0 = الأحد

  const days: (Date | null)[] = [];

  // أيام فارغة في الأول
  for (let i = 0; i < startWeekDay; i++) {
    days.push(null);
  }

  // أيام الشهر
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push(new Date(year, month, d));
  }

  // اكمل لـ 42 خلية (6 أسابيع)
  while (days.length < 42) {
    days.push(null);
  }

  return days;
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function CalendarView({ items }: { items: ContentItem[] }) {
  const t = useTranslations("dashboard.content.calendar");
  const locale = useLocale();

  const today = new Date();
  const [currentDate, setCurrentDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthName = currentDate.toLocaleDateString(
    locale === "ar" ? "ar-EG" : "en-US",
    { month: "long", year: "numeric" }
  );

  // أيام الأسبوع
  const weekDays =
    locale === "ar"
      ? ["أحد", "اثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"]
      : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // نجمّع المحتوى حسب اليوم
  const itemsByDay = useMemo(() => {
    const map = new Map<string, ContentItem[]>();
    items.forEach((item) => {
      if (!item.scheduled_at) return;
      const date = new Date(item.scheduled_at);
      const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(item);
    });
    return map;
  }, [items]);

  const days = getMonthDays(year, month);

  const goToPrev = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNext = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
  };

  // العدد الإجمالي للمحتوى المجدول في الشهر ده
  const monthItemCount = items.filter((item) => {
    if (!item.scheduled_at) return false;
    const d = new Date(item.scheduled_at);
    return d.getFullYear() === year && d.getMonth() === month;
  }).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
            <CalendarIcon className="size-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight md:text-2xl">
              {monthName}
            </h2>
            <p className="text-xs text-muted-foreground">
              {t("monthSummary", { count: monthItemCount })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={goToToday}
            className="rounded-full"
          >
            {t("today")}
          </Button>
          <div className="flex items-center rounded-full border border-border">
            <Button
              variant="ghost"
              size="icon"
              onClick={goToPrev}
              className="size-8 rounded-full"
              aria-label={t("prev")}
            >
              <ChevronRight className="size-4 rtl:hidden" />
              <ChevronLeft className="size-4 hidden rtl:block" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={goToNext}
              className="size-8 rounded-full"
              aria-label={t("next")}
            >
              <ChevronLeft className="size-4 rtl:hidden" />
              <ChevronRight className="size-4 hidden rtl:block" />
            </Button>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        {Object.entries(STATUS_COLORS).slice(0, 5).map(([key, cls]) => (
          <div key={key} className="flex items-center gap-1.5">
            <span className={`size-2 rounded-full ${cls}`} />
            <span>{t(`statuses.${key}`)}</span>
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="glass-strong overflow-hidden rounded-3xl p-2 md:p-4">
        {/* Week Days Header */}
        <div className="grid grid-cols-7 gap-1 md:gap-2">
          {weekDays.map((day) => (
            <div
              key={day}
              className="p-2 text-center text-xs font-semibold text-muted-foreground"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="mt-1 grid grid-cols-7 gap-1 md:gap-2">
          {days.map((day, idx) => {
            if (!day) {
              return (
                <div
                  key={`empty-${idx}`}
                  className="min-h-[80px] rounded-xl md:min-h-[120px]"
                />
              );
            }

            const key = `${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`;
            const dayItems = itemsByDay.get(key) ?? [];
            const isToday = isSameDay(day, today);
            const dayNum = day.getDate();

            return (
              <div
                key={key}
                className={`
                  group relative min-h-[80px] rounded-xl border p-1.5 transition md:min-h-[120px] md:p-2
                  ${
                    isToday
                      ? "border-primary bg-primary/5"
                      : "border-border/40 hover:border-primary/30 hover:bg-muted/30"
                  }
                `}
              >
                {/* Day Number */}
                <div className="flex items-center justify-between">
                  <span
                    className={`flex size-6 items-center justify-center rounded-full text-xs font-semibold ${
                      isToday
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    {dayNum}
                  </span>
                  {dayItems.length > 0 && (
                    <span className="text-[10px] font-medium text-muted-foreground">
                      {dayItems.length}
                    </span>
                  )}
                </div>

                {/* Items */}
                <div className="mt-1.5 space-y-1">
                  {dayItems.slice(0, 3).map((item) => (
                    <Link
                      key={item.id}
                      href={`/dashboard/content/${item.id}`}
                      className={`
                        block truncate rounded-md px-1.5 py-1 text-[10px] font-medium text-white transition hover:opacity-80 md:text-xs
                        ${STATUS_COLORS[item.status] ?? "bg-muted-foreground/40"}
                      `}
                      title={item.title}
                    >
                      <span className="flex items-center gap-1">
                        {item.platform && (
                          <span
                            className={`inline-block size-1.5 shrink-0 rounded-full ${PLATFORM_COLORS[item.platform] ?? "bg-white/50"}`}
                          />
                        )}
                        <span className="truncate">{item.title}</span>
                      </span>
                    </Link>
                  ))}

                  {dayItems.length > 3 && (
                    <div className="px-1.5 text-[10px] font-medium text-muted-foreground">
                      +{dayItems.length - 3} {t("more")}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}