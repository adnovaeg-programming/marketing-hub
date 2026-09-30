import { redirect } from "next/navigation";
import { Shield } from "lucide-react";

import { isPlatformAdmin } from "@/lib/permissions/server";
import { AdminNav } from "@/components/admin/admin-nav";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const { isAdmin } = await isPlatformAdmin();

  if (!isAdmin) {
    redirect(`/${locale}/dashboard`);
  }

  return (
    <div className="flex min-h-screen flex-1 flex-col">
      <header className="glass sticky top-0 z-40 border-b border-glass-border">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 md:px-8">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-destructive to-accent shadow-lg shadow-destructive/30">
              <Shield className="size-4.5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold">Platform Admin</p>
              <p className="text-[10px] text-muted-foreground">Marketing Hub</p>
            </div>
          </div>
        </div>
      </header>

      <AdminNav />

      <main className="flex-1">{children}</main>
    </div>
  );
}