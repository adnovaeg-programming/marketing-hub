"use client";

import { usePathname } from "next/navigation";

import { Navbar } from "./navbar";

export function ConditionalNavbar({
  user,
}: {
  user: { email: string } | null;
}) {
  const pathname = usePathname();

  const isDashboard = pathname?.includes("/dashboard");

  if (isDashboard) return null;

  return <Navbar user={user} />;
}