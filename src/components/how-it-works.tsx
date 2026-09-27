const STEPS = [
  {
    number: "01",
    title: "أنشئ مساحة عملك",
    description:
      "سجّل مجانًا، وحدّد إن كنت وكالة، مستقل، أو شركة — في أقل من دقيقة.",
  },
  {
    number: "02",
    title: "ادعُ فريقك وعملاءك",
    description:
      "أضف الأعضاء، ووزّع الأدوار، وابدأ التعاون على المحتوى والمهام مباشرة.",
  },
  {
    number: "03",
    title: "انطلق وانمُ",
    description:
      "خطّط، انشر، حلّل، وحصّل أرباحك — كل ده من لوحة تحكم واحدة.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-24 md:py-32">
      {/* خلفية تدرج خفيف */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-primary/[0.03] to-transparent" />

      <div className="mx-auto max-w-7xl px-4 md:px-8">
        {/* رأس القسم */}
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
            ابدأ في
            <span className="bg-gradient-to-l from-primary via-accent to-primary bg-clip-text text-transparent">
              {" "}3 خطوات
            </span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            من التسجيل لأول حملة ناجحة — بدون تعقيد ولا إعداد طويل.
          </p>
        </div>

        {/* الخطوات */}
        <div className="relative mt-16">
          {/* خط أفقي يربط الخطوات (يظهر من md) */}
          <div className="absolute right-[16%] left-[16%] top-10 hidden h-px bg-gradient-to-l from-transparent via-border to-transparent md:block" />

          <div className="grid gap-8 md:grid-cols-3">
            {STEPS.map((step) => (
              <div key={step.number} className="relative flex flex-col items-center text-center">
                {/* الرقم */}
                <div className="relative flex size-20 items-center justify-center rounded-full border border-border/60 bg-card shadow-lg">
                  <span className="bg-gradient-to-br from-primary to-accent bg-clip-text text-2xl font-bold text-transparent">
                    {step.number}
                  </span>
                  {/* هالة توهج */}
                  <div className="absolute inset-0 -z-10 rounded-full bg-primary/20 blur-xl" />
                </div>

                <h3 className="mt-6 text-xl font-semibold">{step.title}</h3>
                <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}