"use client";

import { Sparkles, ArrowLeft, Play, Search, Mail, Lock } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const COLOR_SWATCHES = [
  { name: "primary", class: "bg-primary", text: "text-primary-foreground" },
  { name: "secondary", class: "bg-secondary", text: "text-secondary-foreground" },
  { name: "muted", class: "bg-muted", text: "text-muted-foreground" },
  { name: "accent", class: "bg-accent", text: "text-accent-foreground" },
  { name: "destructive", class: "bg-destructive", text: "text-destructive-foreground" },
  { name: "background", class: "bg-background border border-border", text: "text-foreground" },
  { name: "foreground", class: "bg-foreground", text: "text-background" },
] as const;

const RADIUS_SIZES = [
  { name: "sm", class: "rounded-sm" },
  { name: "md", class: "rounded-md" },
  { name: "lg", class: "rounded-lg" },
  { name: "xl", class: "rounded-xl" },
  { name: "2xl", class: "rounded-2xl" },
  { name: "3xl", class: "rounded-3xl" },
  { name: "full", class: "rounded-full" },
] as const;

export default function StyleGuidePage() {
  const t = useTranslations("styleGuide");

  return (
    <main className="flex-1">
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-24">
        {/* Header */}
        <div className="text-center">
          <div className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm">
            <Sparkles className="size-4 text-primary" />
            <span className="text-muted-foreground">v1.0</span>
          </div>
          <h1 className="mt-6 text-4xl font-bold tracking-tight md:text-5xl">
            {t("title")}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">{t("subtitle")}</p>
        </div>

        {/* 1. Colors */}
        <Section title={t("sections.colors")}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {COLOR_SWATCHES.map((color) => (
              <div
                key={color.name}
                className="glass glass-hover overflow-hidden rounded-2xl"
              >
                <div
                  className={`flex h-24 items-end p-3 ${color.class} ${color.text}`}
                >
                  <span className="text-xs font-medium opacity-80">
                    {t(`labels.${color.name}`)}
                  </span>
                </div>
                <div className="p-3">
                  <p className="text-xs font-mono text-muted-foreground">
                    {color.name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* 2. Typography */}
        <Section title={t("sections.typography")}>
          <div className="glass space-y-6 rounded-2xl p-8">
            <div>
              <p className="text-xs text-muted-foreground">text-5xl / font-bold</p>
              <h1 className="text-5xl font-bold">Heading 1</h1>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">text-4xl / font-bold</p>
              <h2 className="text-4xl font-bold">Heading 2</h2>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">text-3xl / font-semibold</p>
              <h3 className="text-3xl font-semibold">Heading 3</h3>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">text-2xl / font-semibold</p>
              <h4 className="text-2xl font-semibold">Heading 4</h4>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">text-lg</p>
              <p className="text-lg">Large paragraph — {t("subtitle")}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">text-base</p>
              <p className="text-base">Body text — {t("subtitle")}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">text-sm</p>
              <p className="text-sm text-muted-foreground">
                Small text — {t("subtitle")}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">text-gradient</p>
              <p className="text-gradient text-3xl font-bold">Marketing Hub</p>
            </div>
          </div>
        </Section>

        {/* 3. Buttons */}
        <Section title={t("sections.buttons")}>
          <div className="space-y-6">
            {/* Variants */}
            <div className="glass rounded-2xl p-6">
              <p className="mb-4 text-sm font-medium text-muted-foreground">
                Variants
              </p>
              <div className="flex flex-wrap gap-3">
                <Button>{t("buttonVariants.default")}</Button>
                <Button variant="outline">{t("buttonVariants.outline")}</Button>
                <Button variant="ghost">{t("buttonVariants.ghost")}</Button>
                <Button variant="secondary">{t("buttonVariants.secondary")}</Button>
                <Button variant="destructive">
                  {t("buttonVariants.destructive")}
                </Button>
              </div>
            </div>

            {/* Sizes */}
            <div className="glass rounded-2xl p-6">
              <p className="mb-4 text-sm font-medium text-muted-foreground">
                Sizes
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Button size="sm">Small</Button>
                <Button size="default">Default</Button>
                <Button size="lg">Large</Button>
                <Button size="icon">
                  <Play className="size-4" />
                </Button>
              </div>
            </div>

            {/* With Icons */}
            <div className="glass rounded-2xl p-6">
              <p className="mb-4 text-sm font-medium text-muted-foreground">
                With Icons
              </p>
              <div className="flex flex-wrap gap-3">
                <Button className="group rounded-full">
                  ابدأ الآن
                  <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
                </Button>
                <Button variant="outline" className="glass glass-hover rounded-full">
                  <Play className="size-4" />
                  شاهد العرض
                </Button>
              </div>
            </div>
          </div>
        </Section>

        {/* 4. Glass */}
        <Section title={t("sections.glass")}>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="glass rounded-2xl p-6">
              <p className="mb-2 text-sm font-medium">.glass</p>
              <p className="text-xs text-muted-foreground">
                الزجاج الأساسي — للكروت العادية
              </p>
            </div>
            <div className="glass-strong rounded-2xl p-6">
              <p className="mb-2 text-sm font-medium">.glass-strong</p>
              <p className="text-xs text-muted-foreground">
                زجاج كثيف — للكروت الرئيسية
              </p>
            </div>
            <div className="glass glass-hover glass-shimmer rounded-2xl p-6">
              <p className="mb-2 text-sm font-medium">.glass-hover + shimmer</p>
              <p className="text-xs text-muted-foreground">
                مرّر الماوس — يرتفع + يلمع
              </p>
            </div>
          </div>
        </Section>

        {/* 5. Inputs */}
        <Section title={t("sections.inputs")}>
          <div className="glass mx-auto max-w-md space-y-4 rounded-2xl p-8">
            <div className="space-y-2">
              <Label htmlFor="sample-email">Email</Label>
              <div className="relative">
                <Mail className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="sample-email"
                  placeholder="you@example.com"
                  className="h-11 ps-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sample-password">Password</Label>
              <div className="relative">
                <Lock className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="sample-password"
                  type="password"
                  placeholder="••••••••"
                  className="h-11 ps-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sample-search">Search</Label>
              <div className="relative">
                <Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="sample-search"
                  placeholder="Search..."
                  className="h-11 ps-10"
                />
              </div>
            </div>
          </div>
        </Section>

        {/* 6. Animations */}
        <Section title={t("sections.animations")}>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="glass rounded-2xl p-6 text-center">
              <div className="animate-float mx-auto mb-4 size-16 rounded-full bg-gradient-to-br from-primary to-accent" />
              <p className="text-sm font-medium">animate-float</p>
              <p className="text-xs text-muted-foreground">طَفْو ناعم</p>
            </div>
            <div className="glass rounded-2xl p-6 text-center">
              <div className="animate-glow-pulse mx-auto mb-4 size-16 rounded-full bg-primary/40 blur-md" />
              <p className="text-sm font-medium">animate-glow-pulse</p>
              <p className="text-xs text-muted-foreground">توهج نابض</p>
            </div>
            <div className="glass glass-shimmer rounded-2xl p-6 text-center">
              <div className="mx-auto mb-4 size-16 rounded-full bg-gradient-to-br from-accent to-primary" />
              <p className="text-sm font-medium">glass-shimmer</p>
              <p className="text-xs text-muted-foreground">لمعان متحرك</p>
            </div>
          </div>
        </Section>

        {/* 7. Radius */}
        <Section title={t("sections.radius")}>
          <div className="glass rounded-2xl p-6">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7">
              {RADIUS_SIZES.map((r) => (
                <div key={r.name} className="text-center">
                  <div
                    className={`mx-auto mb-2 size-16 bg-gradient-to-br from-primary to-accent ${r.class}`}
                  />
                  <p className="text-xs font-mono text-muted-foreground">
                    {r.name}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* Footer */}
        <div className="mt-20 text-center">
          <p className="text-sm text-muted-foreground">
            🎨 Marketing Hub Design System — v1.0
          </p>
        </div>
      </div>
    </main>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-20">
      <h2 className="mb-8 text-2xl font-bold tracking-tight">{title}</h2>
      {children}
    </section>
  );
}