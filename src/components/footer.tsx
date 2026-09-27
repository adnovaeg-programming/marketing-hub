import { Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";

export function Footer() {
  const t = useTranslations("footer");

  const columns = [
    {
      title: t("product"),
      links: [
        { key: "features", href: "#features" },
        { key: "pricing", href: "#pricing" },
        { key: "marketplace", href: "#marketplace" },
      ],
    },
    {
      title: t("company"),
      links: [
        { key: "about", href: "#" },
        { key: "contact", href: "#" },
        { key: "careers", href: "#" },
      ],
    },
    {
      title: t("resources"),
      links: [
        { key: "blog", href: "#" },
        { key: "help", href: "#" },
        { key: "docs", href: "#" },
      ],
    },
    {
      title: t("legal"),
      links: [
        { key: "terms", href: "#" },
        { key: "privacy", href: "#" },
        { key: "commission", href: "#" },
      ],
    },
  ] as const;

  return (
    <footer className="glass relative mt-16 rounded-t-[2.5rem] border-x-0 border-b-0">
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg">
              <Sparkles className="size-6 text-primary" />
              <span>Marketing Hub</span>
            </Link>
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">
              {t("tagline")}
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="mb-4 text-sm font-semibold">{col.title}</h3>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.key}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition hover:text-primary"
                    >
                      {t(`links.${link.key}`)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/40 pt-8 md:flex-row">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Marketing Hub. {t("rights")}
          </p>
          <p className="text-sm text-muted-foreground">{t("madeIn")}</p>
        </div>
      </div>
    </footer>
  );
}