import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { PortalHeader } from "@/components/portal/portal-header";
import { BackgroundLayer } from "@/components/background-layer";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // نجيب الـ workspace
  const { data: member } = await supabase
    .from("workspace_members")
    .select(
      `
      workspace_id,
      workspace:workspaces (id, name, slug)
    `
    )
    .eq("user_id", user.id)
    .eq("status", "active")
    .limit(1)
    .maybeSingle();

  const workspace = member
    ? Array.isArray(member.workspace)
      ? member.workspace[0]
      : member.workspace
    : null;

  return (
    <div className="flex min-h-screen flex-1 flex-col">
      <BackgroundLayer />
      <PortalHeader
        workspaceName={workspace?.name ?? ""}
        userEmail={user.email ?? ""}
      />
      <main className="flex-1">{children}</main>
    </div>
  );
}