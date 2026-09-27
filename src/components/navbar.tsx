"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/theme-toggle";

const NAV_LINKS = [
  { href: "#features", label: "المميزات" },
  { href: "#pricing", label: "الأسعار" },
  { href: "#marketplace", label: "Marketplace" },
  { href: "#how-it-works", label: "كيف يعمل؟" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-lg">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 md:px-8">
        {/* الشعار — على اليمين في RTL */}
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <Sparkles className="size-6 text-primary" />
          <span className="text-foreground">Marketing Hub</span>
        </Link>

        {/* الروابط — تظهر من md وأعلى */}
        <div className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* الإجراءات — على اليسار */}
        <div className="flex items-center gap-2">
          <ThemeToggle />

          {/* أزرار سطح المكتب */}
          <div className="hidden md:flex items-center gap-2">
            <Button variant="ghost" size="sm">
              تسجيل الدخول
            </Button>
            <Button size="sm" className="rounded-full px-5">
              ابدأ الآن
            </Button>
          </div>

          {/* زر Hamburger — يظهر في الموبايل فقط */}
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
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4">
                  <Button variant="outline" onClick={() => setOpen(false)}>
                    تسجيل الدخول
                  </Button>
                  <Button onClick={() => setOpen(false)}>ابدأ الآن</Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}