import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import {
  getActiveWorkspaceId,
  getUserWorkspaces,
} from "@/lib/workspace/active";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardTopbar } from "@/components/dashboard/topbar";
import { CommandPalette } from "@/components/fx/command-palette";
import { PageTransition } from "@/components/fx/page-transition";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // لو الدور client أو viewer → نوديه للـ Portal
  const { data: member } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("user_id", user.id)
    .eq("status", "active")
    .limit(1)
    .maybeSingle();

  if (member?.role === "client" || member?.role === "viewer") {
    redirect("/portal");
  }

  const activeWorkspaceId = await getActiveWorkspaceId();
  const workspaces = await getUserWorkspaces();

  return (
    <div className="flex flex-1 flex-col md:flex-row">
      <DashboardSidebar
        activeWorkspaceId={activeWorkspaceId}
        workspaces={workspaces}
      />
      <main className="flex-1 min-w-0">
        <DashboardTopbar />
        <PageTransition>{children}</PageTransition>
      </main>
      <CommandPalette />
    </div>
  );
}