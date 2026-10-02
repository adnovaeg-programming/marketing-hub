"use client";

import { useState } from "react";
import { Menu, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";

const NAV_LINKS = [
  { href: "/#features", key: "features" },
  { href: "/#pricing", key: "pricing" },
  { href: "/marketplace", key: "marketplace" },
  { href: "/#how-it-works", key: "howItWorks" },
] as const;

export function Navbar({ user }: { user: { email: string } | null }) {
  const [open, setOpen] = useState(false);
  const t = useTranslations("nav");

  const linkClass =
    "relative rounded-full px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground";

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="glass border-b border-glass-border">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 md:px-8">
          {/* Logo */}
          <Link href="/" className="group flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/30 transition-transform group-hover:scale-105">
              <Sparkles className="size-4.5 text-white" />
            </div>
            <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text font-bold tracking-tight text-transparent">
              One Post
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) =>
              link.href.startsWith("/") && !link.href.includes("#") ? (
                <Link key={link.key} href={link.href} className={linkClass}>
                  {t(link.key)}
                </Link>
              ) : (
                <a key={link.key} href={link.href} className={linkClass}>
                  {t(link.key)}
                </a>
              )
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5">
            <LanguageSwitcher />
            <ThemeToggle />

            <div className="hidden items-center gap-2 md:flex">
              {user ? (
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="rounded-full"
                >
                  <Link href="/dashboard">{t("dashboard")}</Link>
                </Button>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="rounded-full"
                  >
                    <Link href="/login">{t("login")}</Link>
                  </Button>
                  <Button
                    size="sm"
                    asChild
                    className="rounded-full bg-gradient-to-r from-primary to-accent px-5 shadow-lg shadow-primary/30 transition-shadow hover:shadow-xl hover:shadow-primary/40"
                  >
                    <Link href="/register">{t("getStarted")}</Link>
                  </Button>
                </>
              )}
            </div>

            {/* Mobile menu */}
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full md:hidden"
                >
                  <Menu className="size-5" />
                  <span className="sr-only">افتح القائمة</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="glass-strong w-72 p-0">
                <SheetHeader className="sr-only">
                  <SheetTitle>Navigation</SheetTitle>
                </SheetHeader>

                <div className="flex flex-col p-6">
                  <Link
                    href="/"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2.5"
                  >
                    <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/30">
                      <Sparkles className="size-4.5 text-white" />
                    </div>
                    <span className="font-bold">One Post</span>
                  </Link>

                  <nav className="mt-6 flex flex-col gap-1">
                    {NAV_LINKS.map((link) =>
                      link.href.startsWith("/") && !link.href.includes("#") ? (
                        <Link
                          key={link.key}
                          href={link.href}
                          onClick={() => setOpen(false)}
                          className="rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition hover:bg-muted/50 hover:text-foreground"
                        >
                          {t(link.key)}
                        </Link>
                      ) : (
                        <a
                          key={link.key}
                          href={link.href}
                          onClick={() => setOpen(false)}
                          className="rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition hover:bg-muted/50 hover:text-foreground"
                        >
                          {t(link.key)}
                        </a>
                      )
                    )}
                  </nav>

                  <div className="mt-6 flex flex-col gap-2 border-t border-border/40 pt-6">
                    {user ? (
                      <Button
                        asChild
                        className="rounded-xl"
                        onClick={() => setOpen(false)}
                      >
                        <Link href="/dashboard">{t("dashboard")}</Link>
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          asChild
                          className="rounded-xl"
                          onClick={() => setOpen(false)}
                        >
                          <Link href="/login">{t("login")}</Link>
                        </Button>
                        <Button
                          asChild
                          className="rounded-xl bg-gradient-to-r from-primary to-accent"
                          onClick={() => setOpen(false)}
                        >
                          <Link href="/register">{t("getStarted")}</Link>
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </nav>
      </div>
    </header>
  );
}