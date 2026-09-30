"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { useRouter } from "@/i18n/navigation";
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  CheckSquare,
  FileText,
  Bell,
  BarChart3,
  Settings,
  UserCircle,
  Plus,
  Search,
  Moon,
  Sun,
  ArrowRight,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";

const NAV_ITEMS = [
  { href: "/dashboard", icon: LayoutDashboard, key: "overview" },
  { href: "/dashboard/clients", icon: Users, key: "clients" },
  { href: "/dashboard/projects", icon: FolderKanban, key: "projects" },
  { href: "/dashboard/tasks", icon: CheckSquare, key: "tasks" },
  { href: "/dashboard/content", icon: FileText, key: "content" },
  { href: "/dashboard/notifications", icon: Bell, key: "notifications" },
  { href: "/dashboard/analytics", icon: BarChart3, key: "analytics" },
  { href: "/dashboard/profile", icon: UserCircle, key: "profile" },
  { href: "/dashboard/settings", icon: Settings, key: "settings" },
] as const;

const QUICK_ACTIONS = [
  { href: "/dashboard/clients", icon: Plus, key: "newClient", shortcut: "C" },
  { href: "/dashboard/projects", icon: Plus, key: "newProject", shortcut: "P" },
  { href: "/dashboard/tasks", icon: Plus, key: "newTask", shortcut: "T" },
  { href: "/dashboard/content", icon: Plus, key: "newContent", shortcut: "N" },
] as const;

type Group = "navigation" | "actions" | "preferences";

type Item = {
  id: string;
  group: Group;
  label: string;
  icon: typeof LayoutDashboard;
  action: () => void;
  shortcut?: string;
};

export function CommandPalette() {
  const t = useTranslations("dashboard.commandPalette");
  const tNav = useTranslations("dashboard.nav");
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Open via custom event + keyboard shortcut
  useEffect(() => {
    const handleOpen = () => setOpen(true);

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };

    window.addEventListener("open-command-palette", handleOpen);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("open-command-palette", handleOpen);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  // Reset state on open + focus input
  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Build items
  const items: Item[] = useMemo(() => {
    const navItems: Item[] = NAV_ITEMS.map((item) => ({
      id: `nav-${item.href}`,
      group: "navigation" as const,
      label: tNav(item.key),
      icon: item.icon,
      action: () => {
        setOpen(false);
        setTimeout(() => router.push(item.href), 80);
      },
    }));

    const actionItems: Item[] = QUICK_ACTIONS.map((item) => ({
      id: `action-${item.key}`,
      group: "actions" as const,
      label: t(`actions.${item.key}`),
      icon: item.icon,
      shortcut: item.shortcut,
      action: () => {
        setOpen(false);
        setTimeout(() => router.push(item.href), 80);
      },
    }));

    const prefs: Item[] = [
      {
        id: "pref-theme",
        group: "preferences" as const,
        label: t("actions.toggleTheme"),
        icon: resolvedTheme === "dark" ? Sun : Moon,
        shortcut: "⇧ D",
        action: () => {
          setTheme(resolvedTheme === "dark" ? "light" : "dark");
          setOpen(false);
        },
      },
    ];

    return [...navItems, ...actionItems, ...prefs];
  }, [t, tNav, router, resolvedTheme, setTheme]);

  // Filter items
  const filtered = useMemo(() => {
    if (!query.trim()) return items;
    const q = query.toLowerCase().trim();
    return items.filter((item) => item.label.toLowerCase().includes(q));
  }, [items, query]);

  // Group filtered
  const grouped = useMemo(() => {
    const groups: Record<Group, Item[]> = {
      navigation: [],
      actions: [],
      preferences: [],
    };
    filtered.forEach((item) => {
      groups[item.group].push(item);
    });
    return groups;
  }, [filtered]);

  // Handle keyboard nav
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = filtered[activeIndex];
      if (item) item.action();
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    }
  };

  // Scroll active item into view
  useEffect(() => {
    const el = listRef.current?.querySelector(
      `[data-index="${activeIndex}"]`
    ) as HTMLElement | null;
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  if (!open) return null;

  const groupLabels: Record<Group, string> = {
    navigation: t("sections.navigation"),
    actions: t("sections.actions"),
    preferences: t("sections.preferences"),
  };

  let globalIndex = -1;

  return (
    <div
      className="animate-fade-in-up fixed inset-0 z-[200] flex items-start justify-center bg-black/40 p-4 pt-[12vh] backdrop-blur-sm"
      onClick={() => setOpen(false)}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="glass-strong w-full max-w-lg overflow-hidden rounded-2xl border border-glass-border shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-2 border-b border-border/40 px-4 py-3">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder={t("placeholder")}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <kbd className="rounded border border-border/60 bg-muted/40 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
            Esc
          </kbd>
        </div>

        {/* Items */}
        <div ref={listRef} className="max-h-80 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Search className="size-8 text-muted-foreground/40" />
              <p className="mt-3 text-sm text-muted-foreground">
                {t("empty")}
              </p>
            </div>
          ) : (
            (["navigation", "actions", "preferences"] as const).map((group) => {
              const groupItems = grouped[group];
              if (groupItems.length === 0) return null;

              return (
                <div key={group} className="mb-1 last:mb-0">
                  <p className="px-2 py-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    {groupLabels[group]}
                  </p>
                  {groupItems.map((item) => {
                    globalIndex += 1;
                    const isActive = globalIndex === activeIndex;
                    const Icon = item.icon;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        data-index={globalIndex}
                        onClick={item.action}
                        onMouseEnter={() => setActiveIndex(globalIndex)}
                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-start text-sm transition ${
                          isActive
                            ? "bg-primary/10 text-primary"
                            : "text-foreground hover:bg-muted/50"
                        }`}
                      >
                        <Icon className="size-4 shrink-0" />
                        <span className="flex-1 truncate">{item.label}</span>
                        {item.shortcut && (
                          <kbd className="shrink-0 rounded border border-border/60 bg-muted/30 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                            {item.shortcut}
                          </kbd>
                        )}
                        {isActive && (
                          <ArrowRight className="size-3.5 shrink-0 opacity-60 rtl:rotate-180" />
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border/40 px-4 py-2 text-[10px] text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-border/60 bg-muted/40 px-1 py-0.5 font-mono">
                ↑↓
              </kbd>
              تنقل
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-border/60 bg-muted/40 px-1 py-0.5 font-mono">
                ↵
              </kbd>
              اختيار
            </span>
          </div>
          <span>{filtered.length}</span>
        </div>
      </div>
    </div>
  );
}