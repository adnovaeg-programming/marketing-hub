"use client";

import { useState } from "react";
import { Loader2, Plus, AlertCircle, Copy, Check } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createInvitationAction } from "@/app/[locale]/dashboard/settings/invitations-actions";

const ROLES = ["admin", "member", "client", "viewer"] as const;

export function InviteMemberDialog() {
  const t = useTranslations("dashboard.settings.members.invite");
  const tRoles = useTranslations("dashboard.settings.members.roles");
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState<string>("member");
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setPending(true);

    const form = new FormData(e.currentTarget);
    const result = await createInvitationAction({
      email: String(form.get("email") ?? ""),
      role: role as never,
    });

    setPending(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    const url = `${window.location.origin}/invite/${result.token}`;
    setInviteUrl(url);
  };

  const handleCopy = async () => {
    if (!inviteUrl) return;
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    setOpen(false);
    setTimeout(() => {
      setInviteUrl(null);
      setError(null);
      setRole("member");
      setCopied(false);
    }, 200);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => (v ? setOpen(true) : handleClose())}>
      <DialogTrigger asChild>
        <Button className="rounded-full shadow-lg shadow-primary/30">
          <Plus className="size-4" />
          {t("trigger")}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-lg">
        {!inviteUrl ? (
          <>
            <DialogHeader>
              <DialogTitle>{t("title")}</DialogTitle>
              <DialogDescription>{t("description")}</DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t("email")} *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="member@example.com"
                  required
                  className="h-11"
                  dir="ltr"
                />
              </div>

              <div className="space-y-2">
                <Label>{t("role")}</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((r) => (
                      <SelectItem key={r} value={r}>
                        {tRoles(r)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {error && (
                <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
                  <AlertCircle className="mt-0.5 size-4 shrink-0" />
                  <span>{t(`errors.${error}`, { default: error })}</span>
                </div>
              )}

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={pending}
                >
                  {t("cancel")}
                </Button>
                <Button type="submit" disabled={pending}>
                  {pending && <Loader2 className="size-4 animate-spin" />}
                  {t("submit")}
                </Button>
              </DialogFooter>
            </form>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>{t("successTitle")}</DialogTitle>
              <DialogDescription>{t("successDescription")}</DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Input
                  value={inviteUrl}
                  readOnly
                  className="h-11 font-mono text-xs"
                  dir="ltr"
                  onFocus={(e) => e.currentTarget.select()}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleCopy}
                  className="size-11 shrink-0"
                >
                  {copied ? (
                    <Check className="size-4 text-emerald-500" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                </Button>
              </div>

              <p className="text-xs text-muted-foreground">
                {t("linkNote")}
              </p>
            </div>

            <DialogFooter>
              <Button onClick={handleClose} className="w-full">
                {t("done")}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}