import { Shield, Sparkles, ArrowLeft } from "lucide-react";

import { Link } from "@/i18n/navigation";

export function LegalPage({
  title,
  updatedAt,
  sections,
}: {
  title: string;
  updatedAt: string;
  sections: { title: string; body: string }[];
}) {
  return (
    <main className="mx-auto max-w-4xl px-4 py-16 md:px-8 md:py-24">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
      >
        <ArrowLeft className="size-4 rtl:rotate-180" />
        الرئيسية
      </Link>

      <div className="glass-strong mt-6 rounded-3xl p-8 md:p-12">
        <div className="flex items-center gap-3">
          <div className="glass flex size-12 items-center justify-center rounded-2xl">
            <Shield className="size-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              {title}
            </h1>
            <p className="mt-1 text-xs text-muted-foreground">{updatedAt}</p>
          </div>
        </div>

        <div className="mt-10 space-y-8">
          {sections.map((section, idx) => (
            <section key={idx}>
              <h2 className="text-xl font-semibold text-foreground">
                {section.title}
              </h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                {section.body}
              </p>
            </section>
          ))}
        </div>

        <div className="mt-12 flex items-center gap-2 border-t border-border/40 pt-6 text-xs text-muted-foreground">
          <Sparkles className="size-3 text-primary" />
          Marketing Hub — كل تسويقك في مكان واحد
        </div>
      </div>
    </main>
  );
}