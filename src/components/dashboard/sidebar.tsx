"use client";

import { useState } from "react";
import { motion } from "motion/react";
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  CheckSquare,
  FileText,
  BarChart3,
  Settings,
  Bell,
  Menu,
  Sparkles,
  LogOut,
  UserCircle,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { WorkspaceSwitcher } from "@/components/dashboard/workspace-switcher";
import { signOutAction } from "@/app/[locale]/login/actions";

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

type Workspace = { id: string; name: string; slug: string; role: string };

/* ═══════════════════════════════════════════════════════
   Desktop Sidebar Content
   ═══════════════════════════════════════════════════════ */

function SidebarContent({
  onNavigate,
  activeWorkspaceId,
  workspaces,
}: {
  onNavigate?: () => void;
  activeWorkspaceId: string | null;
  workspaces: Workspace[];
}) {
  const t = useTranslations("dashboard.nav");
  const pathname = usePathname();
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const handleLogout = async () => {
    setPending(true);
    await signOutAction();
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="flex h-full flex-col">
      {/* Logo + Live pulse */}
      <div className="flex items-center gap-2.5 px-5 pt-5">
        <div className="relative flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/30">
          <Sparkles className="size-4.5 text-white" />
          <span className="animate-pulse-ring absolute inset-0 rounded-xl border border-primary/50" />
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold">Marketing Hub</span>
          <span className="relative flex size-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
          </span>
        </div>
      </div>

      {/* Workspace Switcher */}
      <div className="mt-3 px-3">
        <WorkspaceSwitcher
          currentId={activeWorkspaceId}
          workspaces={workspaces}
        />
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-3">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname?.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`
                group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-300
                ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }
              `}
            >
              <span
                className={`
                  absolute inset-0 rounded-xl bg-gradient-to-r from-primary/15 to-accent/10 transition-all duration-300 ease-out
                  ${isActive ? "scale-100 opacity-100" : "scale-95 opacity-0"}
                `}
              />

              <Icon
                className={`relative size-4 transition-all duration-300 ${
                  isActive ? "scale-110 text-primary" : "group-hover:scale-110"
                }`}
              />

              <span className="relative">{t(item.key)}</span>

              <span
                className={`
                  relative ms-auto size-1.5 rounded-full bg-primary shadow-lg shadow-primary/50 transition-all duration-300
                  ${isActive ? "scale-100 opacity-100" : "scale-0 opacity-0"}
                `}
              />
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="border-t border-glass-border p-3">
        <Button
          variant="ghost"
          onClick={handleLogout}
          disabled={pending}
          className="w-full justify-start gap-3 rounded-xl text-muted-foreground transition-all hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="size-4" />
          {t("logout")}
        </Button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   Mobile Menu (Sheet) — WOW animations
   ═══════════════════════════════════════════════════════ */

function MobileMenu({
  activeWorkspaceId,
  workspaces,
}: {
  activeWorkspaceId: string | null;
  workspaces: Workspace[];
}) {
  const [open, setOpen] = useState(false);
  const t = useTranslations("dashboard.nav");
  const pathname = usePathname();
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const handleLogout = async () => {
    setPending(true);
    await signOutAction();
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="glass sticky top-0 z-40 flex h-16 items-center justify-between border-b border-glass-border px-4 md:hidden">
      {/* Logo */}
      <Link href="/dashboard" className="flex items-center gap-2 font-bold">
        <div className="relative flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent shadow-md shadow-primary/30">
          <Sparkles className="size-4 text-white" />
          <span className="animate-pulse-ring absolute inset-0 rounded-lg border border-primary/50" />
        </div>
        Marketing Hub
      </Link>

      {/* Sheet trigger */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full transition-transform active:scale-90"
          >
            <Menu className="size-5" />
            <span className="sr-only">{t("openMenu")}</span>
          </Button>
        </SheetTrigger>

        <SheetContent
          side="right"
          className="glass-strong w-80 overflow-hidden border-s border-glass-border p-0"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation</SheetTitle>
          </SheetHeader>

          {/* Aurora glow backdrop */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="animate-glow-pulse absolute -top-20 -right-20 size-64 rounded-full bg-primary/20 blur-3xl" />
            <div
              className="animate-glow-pulse absolute -bottom-20 -left-20 size-64 rounded-full bg-accent/15 blur-3xl"
              style={{ animationDelay: "1.5s" }}
            />
            <div className="subtle-grid absolute inset-0 opacity-[0.02] dark:opacity-[0.04]" />
          </div>

          <div className="relative flex h-full flex-col">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="flex items-center gap-2.5 border-b border-glass-border p-5"
            >
              <div className="relative flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/30">
                <Sparkles className="size-5 text-white" />
                <span className="animate-pulse-ring absolute inset-0 rounded-xl border border-primary/50" />
              </div>
              <div>
                <p className="font-bold">Marketing Hub</p>
                <p className="text-[10px] text-muted-foreground">
                  {t("openMenu")}
                </p>
              </div>
            </motion.div>

            {/* Workspace Switcher */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.05, ease: "easeOut" }}
              className="p-4"
            >
              <WorkspaceSwitcher
                currentId={activeWorkspaceId}
                workspaces={workspaces}
              />
            </motion.div>

            {/* Nav Items — Stagger */}
            <motion.nav
              initial="hidden"
              animate="show"
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.04,
                    delayChildren: 0.12,
                  },
                },
              }}
              className="flex-1 space-y-1 overflow-y-auto px-3 py-2"
            >
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.href === "/dashboard"
                    ? pathname === "/dashboard"
                    : pathname?.startsWith(item.href);

                return (
                  <motion.div
                    key={item.href}
                    variants={{
                      hidden: { opacity: 0, y: 8 },
                      show: { opacity: 1, y: 0 },
                    }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={`
                        group relative flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-300 active:scale-[0.98]
                        ${
                          isActive
                            ? "text-primary"
                            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                        }
                      `}
                    >
                      {/* Active gradient */}
                      <span
                        className={`
                          absolute inset-0 rounded-xl bg-gradient-to-r from-primary/15 to-accent/10 transition-all duration-300
                          ${isActive ? "scale-100 opacity-100" : "scale-95 opacity-0"}
                        `}
                      />

                      <Icon
                        className={`relative size-4 transition-all duration-300 ${
                          isActive ? "scale-110" : "group-hover:scale-110"
                        }`}
                      />

                      <span className="relative">{t(item.key)}</span>

                      <span
                        className={`
                          relative ms-auto size-1.5 rounded-full bg-primary shadow-lg shadow-primary/50 transition-all duration-300
                          ${isActive ? "scale-100 opacity-100" : "scale-0 opacity-0"}
                        `}
                      />
                    </Link>
                  </motion.div>
                );
              })}
            </motion.nav>

            {/* Logout */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.45, ease: "easeOut" }}
              className="border-t border-glass-border p-3"
            >
              <Button
                variant="ghost"
                onClick={handleLogout}
                disabled={pending}
                className="w-full justify-start gap-3 rounded-xl text-muted-foreground transition-all active:scale-[0.98] hover:bg-destructive/10 hover:text-destructive"
              >
                <LogOut className="size-4" />
                {t("logout")}
              </Button>
            </motion.div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   Main Export
   ═══════════════════════════════════════════════════════ */

export function DashboardSidebar({
  activeWorkspaceId,
  workspaces,
}: {
  activeWorkspaceId: string | null;
  workspaces: Workspace[];
}) {
  return (
    <>
      {/* Desktop */}
      <aside className="glass sticky top-0 hidden h-screen w-64 shrink-0 border-e border-glass-border md:block">
        <SidebarContent
          activeWorkspaceId={activeWorkspaceId}
          workspaces={workspaces}
        />
      </aside>

      {/* Mobile */}
      <MobileMenu
        activeWorkspaceId={activeWorkspaceId}
        workspaces={workspaces}
      />
    </>
  );
}