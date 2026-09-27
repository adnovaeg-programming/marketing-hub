import {
  Calendar,
  BarChart3,
  Wallet,
  Users,
} from "lucide-react";

const FEATURES = [
  {
    icon: Calendar,
    title: "روزنامة موحدة",
    description:
      "خطّط، جدوِل، وانشر المحتوى على كل المنصات من مكان واحد — بدون تنقل بين الأدوات.",
  },
  {
    icon: Users,
    title: "تعاون مع الفريق",
    description:
      "ادعُ فريقك وعملاءك، ووزّع المهام، وتابع كل تعليق وموافقة في الوقت الحقيقي.",
  },
  {
    icon: BarChart3,
    title: "تقارير ذكية",
    description:
      "تقارير أسبوعية وشهرية تلقائية توضح أداء حملاتك — بدون Excel ولا تصدير.",
  },
  {
    icon: Wallet,
    title: "محفظة ومدفوعات آمنة",
    description:
      "نظام دفع وسيط (Escrow) يحمي حق الطرفين، ومحفظة إلكترونية للسحب السريع.",
  },
];

export function Features() {
  return (
    <section id="features" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        {/* رأس القسم */}
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
            كل ما تحتاجه لـ
            <span className="bg-gradient-to-l from-primary via-accent to-primary bg-clip-text text-transparent">
              {" "}تسويق أنجح
            </span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            أدوات مصممة لتعمل معًا — بدل أن تتشتت بين 5 منصات مختلفة.
          </p>
        </div>

        {/* شبكة المميزات */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card/50 p-6 backdrop-blur transition hover:border-primary/40 hover:bg-card"
              >
                {/* توهج خلف الأيقونة عند الـ hover */}
                <div className="absolute -right-8 -top-8 size-24 rounded-full bg-primary/0 blur-2xl transition-all duration-500 group-hover:bg-primary/30" />

                {/* الأيقونة */}
                <div className="relative mb-5 inline-flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 text-primary">
                  <Icon className="size-6" />
                </div>

                {/* النص */}
                <h3 className="relative mb-2 text-lg font-semibold">
                  {feature.title}
                </h3>
                <p className="relative text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}