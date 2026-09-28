"use client";

import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  FileText,
  CheckSquare,
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
      <div className="flex items-center gap-2 px-6 pt-5">
        <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/30">
          <Sparkles className="size-5 text-white" />
        </div>
        <span className="font-bold">Marketing Hub</span>
      </div>

      <div className="mt-3 px-3">
        <WorkspaceSwitcher
          currentId={activeWorkspaceId}
          workspaces={workspaces}
        />
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
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
                flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition
                ${
                  isActive
                    ? "bg-primary/10 text-primary shadow-sm"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                }
              `}
            >
              <Icon className="size-4" />
              <span>{t(item.key)}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-glass-border p-3">
        <Button
          variant="ghost"
          onClick={handleLogout}
          disabled={pending}
          className="w-full justify-start gap-3 rounded-xl text-muted-foreground hover:text-destructive"
        >
          <LogOut className="size-4" />
          {t("logout")}
        </Button>
      </div>
    </div>
  );
}

function MobileSidebar({
  activeWorkspaceId,
  workspaces,
}: {
  activeWorkspaceId: string | null;
  workspaces: Workspace[];
}) {
  const [open, setOpen] = useState(false);
  const t = useTranslations("dashboard.nav");

  return (
    <div className="glass sticky top-0 z-40 flex h-16 items-center justify-between border-b border-glass-border px-4 md:hidden">
      <Link href="/dashboard" className="flex items-center gap-2 font-bold">
        <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
          <Sparkles className="size-4 text-white" />
        </div>
        Marketing Hub
      </Link>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <Menu className="size-5" />
            <span className="sr-only">{t("openMenu")}</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-72 p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation</SheetTitle>
          </SheetHeader>
          <SidebarContent
            onNavigate={() => setOpen(false)}
            activeWorkspaceId={activeWorkspaceId}
            workspaces={workspaces}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}

export function DashboardSidebar({
  activeWorkspaceId,
  workspaces,
}: {
  activeWorkspaceId: string | null;
  workspaces: Workspace[];
}) {
  return (
    <>
      <aside className="glass sticky top-0 hidden h-screen w-64 shrink-0 border-e border-glass-border md:block">
        <SidebarContent
          activeWorkspaceId={activeWorkspaceId}
          workspaces={workspaces}
        />
      </aside>
      <MobileSidebar
        activeWorkspaceId={activeWorkspaceId}
        workspaces={workspaces}
      />
    </>
  );
}