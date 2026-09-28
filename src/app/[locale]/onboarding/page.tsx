import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { OnboardingWizard } from "@/components/onboarding/wizard";

export default async function OnboardingPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // لو عنده org بالفعل → Dashboard
  const { data: existingOrg } = await supabase
    .from("organizations")
    .select("id")
    .eq("owner_id", user.id)
    .limit(1)
    .maybeSingle();

  if (existingOrg) {
    redirect("/dashboard");
  }

  // بيانات الـ profile للـ default values
  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, last_name, account_type")
    .eq("id", user.id)
    .single();

  const accountType = profile?.account_type ?? "client";
  const defaultName =
    [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") ?? "";

  return (
    <main className="flex-1 py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <OnboardingWizard
          accountType={accountType}
          defaultName={defaultName}
        />
      </div>
    </main>
  );
}