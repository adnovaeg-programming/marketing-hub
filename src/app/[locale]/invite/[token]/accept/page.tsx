import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { InviteAccepter } from "@/components/auth/invite-accepter";

export default async function InviteAcceptPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirect=/invite/${token}`);
  }

  return <InviteAccepter token={token} />;
}