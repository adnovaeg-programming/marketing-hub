import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center gap-4 p-8">
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