"use client";

import { useState, useEffect } from "react";
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
  ShieldAlert,
  Wallet as WalletIcon,
  Briefcase,
  FileSignature,
  MessageSquare,
  AlertTriangle,
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
import { createClient } from "@/lib/supabase/client";
import { signOutAction } from "@/app/[locale]/login/actions";

const NAV_ITEMS = [
  { href: "/dashboard", icon: LayoutDashboard, key: "overview" },
  { href: "/dashboard/clients", icon: Users, key: "clients" },
  { href: "/dashboard/projects", icon: FolderKanban, key: "projects" },
  { href: "/dashboard/tasks", icon: CheckSquare, key: "tasks" },
  { href: "/dashboard/content", icon: FileText, key: "content" },
  { href: "/dashboard/marketplace", icon: Briefcase, key: "marketplace" },
  { href: "/dashboard/marketplace/proposals", icon: FileText, key: "proposals" },
  { href: "/dashboard/contracts", icon: FileSignature, key: "contracts" },
  { href: "/dashboard/disputes", icon: AlertTriangle, key: "disputes" },
  { href: "/dashboard/messages", icon: MessageSquare, key: "messages" },
  { href: "/dashboard/notifications", icon: Bell, key: "notifications" },
  { href: "/dashboard/analytics", icon: BarChart3, key: "analytics" },
  { href: "/dashboard/wallet", icon: WalletIcon, key: "wallet" },
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
  const tAdmin = useTranslations("admin.nav");
  const pathname = usePathname();
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const check = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("platform_admins")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();

      setIsAdmin(!!data);
    };
    check();
  }, []);

  const handleLogout = async () => {
    setPending(true);
    await signOutAction();
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2.5 px-5 pt-5">
        <div className="relative flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/30">
          <Sparkles className="size-4.5 text-white" />
          <span className="animate-pulse-ring absolute inset-0 rounded-xl border border-primary/50" />
        </div>
        <span className="font-bold">One Post</span>
      </div>

      <div className="mt-3 px-3">
        <WorkspaceSwitcher
          currentId={activeWorkspaceId}
          workspaces={workspaces}
        />
      </div>

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
              className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-300 ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              <span
                className={`absolute inset-0 rounded-xl bg-gradient-to-r from-primary/15 to-accent/10 transition-all duration-300 ${
                  isActive ? "scale-100 opacity-100" : "scale-95 opacity-0"
                }`}
              />
              <Icon
                className={`relative size-4 transition-all duration-300 ${
                  isActive ? "scale-110" : "group-hover:scale-110"
                }`}
              />
              <span className="relative">{t(item.key)}</span>
              <span
                className={`relative ms-auto size-1.5 rounded-full bg-primary shadow-lg shadow-primary/50 transition-all duration-300 ${
                  isActive ? "scale-100 opacity-100" : "scale-0 opacity-0"
                }`}
              />
            </Link>
          );
        })}

        {isAdmin && (
          <Link
            href="/admin"
            onClick={onNavigate}
            className="group relative mt-2 flex items-center gap-3 rounded-xl bg-destructive/5 px-3 py-2.5 text-sm font-medium text-destructive transition-all hover:bg-destructive/10"
          >
            <ShieldAlert className="size-4" />
            <span>{tAdmin("overview")}</span>
          </Link>
        )}
      </nav>

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

function MobileMenu({
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
        <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent shadow-md shadow-primary/30">
          <Sparkles className="size-4 text-white" />
        </div>
        One Post
      </Link>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Menu className="size-5" />
            <span className="sr-only">{t("openMenu")}</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="glass-strong w-80 p-0">
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
      <MobileMenu
        activeWorkspaceId={activeWorkspaceId}
        workspaces={workspaces}
      />
    </>
  );
}