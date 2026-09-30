import { getTranslations } from "next-intl/server";

import { LegalPage } from "@/components/legal/legal-page";

export default async function CookiesPage() {
  const t = await getTranslations("legal.cookies");

  return (
    <LegalPage
      title={t("title")}
      updatedAt={t("updatedAt")}
      sections={[
        { title: t("s1.title"), body: t("s1.body") },
        { title: t("s2.title"), body: t("s2.body") },
        { title: t("s3.title"), body: t("s3.body") },
        { title: t("s4.title"), body: t("s4.body") },
      ]}
    />
  );
}