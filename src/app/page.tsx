import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  return (
    <main className="relative flex-1 flex flex-col items-center justify-center gap-4 min-h-screen p-8 text-center">
      {/* زر التبديل بين الـ Dark والـ Light Mode في الأعلى */}
      <div className="absolute top-4 left-4 z-10">
        <ThemeToggle />
      </div>

      <h1 className="text-4xl md:text-6xl font-bold text-primary">
        Marketing Hub
      </h1>

      <p className="text-lg md:text-xl text-muted-foreground">
        منصة موحدة لإدارة التسويق
      </p>

      <div className="mt-4 flex gap-3">
        <Button size="lg" className="rounded-full px-8">
          ابدأ الآن
        </Button>
        <Button size="lg" variant="outline" className="rounded-full px-8">
          اعرف أكثر
        </Button>
      </div>
    </main>
  );
}