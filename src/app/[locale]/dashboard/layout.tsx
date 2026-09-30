import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import {
  getActiveWorkspaceId,
  getUserWorkspaces,
} from "@/lib/workspace/active";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardTopbar } from "@/components/dashboard/topbar";
import { RoleProvider } from "@/components/permissions/role-provider";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(`/${locale}/login`);

  // ✅ الأول: هل المستخدم Platform Admin؟
  const { data: platformAdmin } = await supabase
    .from("platform_admins")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  const isPlatformAdmin = !!platformAdmin;

  // ✅ التاني: نجيب كل عضويته
  const { data: allMemberships } = await supabase
    .from("workspace_members")
    .select("workspace_id, role")
    .eq("user_id", user.id)
    .eq("status", "active");

  // ✅ لو Platform Admin → يدخل Dashboard دايمًا
  // لو مش Admin، ولديه دور client/viewer بس → Portal
  if (!isPlatformAdmin) {
    const hasNonClientRole = (allMemberships ?? []).some(
      (m) => m.role !== "client" && m.role !== "viewer"
    );

    if (!hasNonClientRole) {
      redirect(`/${locale}/portal`);
    }
  }

  // نختار الـ workspace النشط
  const activeWorkspaceId = await getActiveWorkspaceId();
  const workspaces = await getUserWorkspaces();

  // الدور الحالي = دور المستخدم في الـ workspace النشط
  const currentRole =
    allMemberships?.find((m) => m.workspace_id === activeWorkspaceId)?.role ??
    (isPlatformAdmin ? "owner" : "viewer");

  return (
    <RoleProvider role={currentRole as never}>
      <div className="flex flex-1 flex-col md:flex-row">
        <DashboardSidebar
          activeWorkspaceId={activeWorkspaceId}
          workspaces={workspaces}
        />
        <main className="flex-1 min-w-0">
          <DashboardTopbar />
          {children}
        </main>
      </div>
    </RoleProvider>
  );
}