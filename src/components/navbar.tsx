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
  { hash: "features", key: "features" },
  { hash: "pricing", key: "pricing" },
  { hash: "marketplace", key: "marketplace" },
  { hash: "how-it-works", key: "howItWorks" },
] as const;

export function Navbar({ user }: { user: { email: string } | null }) {
  const [open, setOpen] = useState(false);
  const t = useTranslations("nav");

  return (
    <header className="glass sticky top-0 z-50 w-full border-b border-glass-border">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 md:px-8">
        {/* الشعار */}
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <Sparkles className="size-6 text-primary" />
          <span className="text-foreground">Marketing Hub</span>
        </Link>

        {/* الروابط — سطح المكتب */}
        <div className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map((link) => (
            <a
              key={link.hash}
              href={`#${link.hash}`}
              className="text-sm font-medium text-muted-foreground transition hover:text-foreground"
            >
              {t(link.key)}
            </a>
          ))}
        </div>

        {/* الإجراءات */}
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />

          {/* أزرار سطح المكتب */}
          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard">{t("dashboard")}</Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">{t("login")}</Link>
                </Button>
                <Button size="sm" className="rounded-full px-5" asChild>
                  <Link href="/register">{t("getStarted")}</Link>
                </Button>
              </>
            )}
          </div>

          {/* Hamburger Menu — الموبايل */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="size-5" />
                <span className="sr-only">افتح القائمة</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2 text-right">
                  <Sparkles className="size-5 text-primary" />
                  Marketing Hub
                </SheetTitle>
              </SheetHeader>

              <div className="mt-6 flex flex-col gap-2">
                {/* روابط الموبايل */}
                {NAV_LINKS.map((link) => (
                  <a
                    key={link.hash}
                    href={`#${link.hash}`}
                    onClick={() => setOpen(false)}
                    className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
                  >
                    {t(link.key)}
                  </a>
                ))}

                {/* أزرار الموبايل */}
                <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4">
                  {user ? (
                    <Button
                      variant="outline"
                      onClick={() => setOpen(false)}
                      asChild
                    >
                      <Link href="/dashboard">{t("dashboard")}</Link>
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => setOpen(false)}
                        asChild
                      >
                        <Link href="/login">{t("login")}</Link>
                      </Button>
                      <Button onClick={() => setOpen(false)} asChild>
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
    </header>
  );
}