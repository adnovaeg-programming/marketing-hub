"use client";

import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Users,
  Check,
  Sparkles,
  Loader2,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createOrgAndWorkspaceAction } from "@/app/[locale]/onboarding/actions";

type Step = "welcome" | "organization" | "workspace" | "done";

export function OnboardingWizard({
  accountType,
  defaultName,
}: {
  accountType: string;
  defaultName: string;
}) {
  const t = useTranslations("onboarding");
  const router = useRouter();
  const [step, setStep] = useState<Step>("welcome");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [orgName, setOrgName] = useState(defaultName);
  const [workspaceName, setWorkspaceName] = useState("");

  const stepNumber: Record<Step, number> = {
    welcome: 1,
    organization: 2,
    workspace: 3,
    done: 4,
  };

  const current = stepNumber[step];

  const handleFinish = async () => {
    setPending(true);
    setError(null);

    const result = await createOrgAndWorkspaceAction({
      orgName,
      workspaceName,
    });

    if (!result.success) {
      const key = `errors.${result.error}`;
      setError(t.has(key) ? t(key) : result.error);
      setPending(false);
      return;
    }

    setStep("done");
    setPending(false);
  };

  const goToDashboard = () => {
    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div className="mx-auto w-full max-w-2xl">
      {/* Progress Bar */}
      {step !== "done" && (
        <div className="mb-10 flex items-center justify-center gap-2">
          {[1, 2, 3].map((n) => (
            <div key={n} className="flex items-center gap-2">
              <div
                className={`
                  flex size-9 items-center justify-center rounded-full text-sm font-medium transition
                  ${
                    current >= n
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                      : "glass text-muted-foreground"
                  }
                `}
              >
                {current > n ? <Check className="size-4" /> : n}
              </div>
              {n < 3 && (
                <div
                  className={`
                    h-px w-10 transition md:w-16
                    ${current > n ? "bg-primary" : "bg-border"}
                  `}
                />
              )}
            </div>
          ))}
        </div>
      )}

      <div className="glass-strong rounded-3xl p-8 md:p-12">
        {/* Welcome */}
        {step === "welcome" && (
          <div className="space-y-6 text-center">
            <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/30">
              <Sparkles className="size-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              {t("welcome.title")}
            </h1>
            <p className="mx-auto max-w-md text-muted-foreground">
              {t("welcome.description")}
            </p>
            <Button
              size="lg"
              className="group mt-4 rounded-full px-8"
              onClick={() => setStep("organization")}
            >
              {t("welcome.cta")}
              <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
            </Button>
          </div>
        )}

        {/* Organization */}
        {step === "organization" && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/10">
                <Building2 className="size-7 text-primary" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight">
                {t("organization.title")}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {t("organization.description", {
                  type: t(`types.${accountType}`),
                })}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="orgName">{t("organization.fieldLabel")}</Label>
              <Input
                id="orgName"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                placeholder={t("organization.placeholder")}
                className="h-11"
                autoFocus
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep("welcome")}
                className="rounded-xl"
              >
                <ArrowRight className="size-4" />
                {t("back")}
              </Button>
              <Button
                onClick={() => setStep("workspace")}
                disabled={!orgName.trim()}
                className="group flex-1 rounded-xl"
              >
                {t("next")}
                <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
              </Button>
            </div>
          </div>
        )}

        {/* Workspace */}
        {step === "workspace" && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-accent/10">
                <Users className="size-7 text-accent" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight">
                {t("workspace.title")}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {t("workspace.description")}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="workspaceName">
                {t("workspace.fieldLabel")}
              </Label>
              <Input
                id="workspaceName"
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                placeholder={t("workspace.placeholder")}
                className="h-11"
                autoFocus
              />
            </div>

            {error && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep("organization")}
                disabled={pending}
                className="rounded-xl"
              >
                <ArrowRight className="size-4" />
                {t("back")}
              </Button>
              <Button
                onClick={handleFinish}
                disabled={!workspaceName.trim() || pending}
                className="group flex-1 rounded-xl"
              >
                {pending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    {t("creating")}
                  </>
                ) : (
                  <>
                    {t("finish")}
                    <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Done */}
        {step === "done" && (
          <div className="space-y-6 text-center">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/30">
              <Check className="size-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              {t("done.title")}
            </h2>
            <p className="mx-auto max-w-md text-muted-foreground">
              {t("done.description")}
            </p>
            <Button
              size="lg"
              className="group mt-4 rounded-full px-8"
              onClick={goToDashboard}
            >
              {t("done.cta")}
              <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}