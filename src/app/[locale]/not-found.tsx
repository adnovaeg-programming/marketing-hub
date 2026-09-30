import { Sparkles, Home, ArrowLeft } from "lucide-react";

import { Link } from "@/i18n/navigation";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-20">
      <div className="glass-strong mx-auto max-w-md rounded-3xl p-10 text-center">
        <div className="mx-auto flex size-20 items-center justify-center rounded-3xl bg-gradient-to-br from-primary to-accent shadow-2xl shadow-primary/30">
          <Sparkles className="size-10 text-white" />
        </div>
        <h1 className="mt-6 text-6xl font-bold text-gradient">404</h1>
        <h2 className="mt-3 text-2xl font-bold">الصفحة مش موجودة</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          الصفحة اللي بتدور عليها مش موجودة أو اتنقلت.
        </p>

        <Link
          href="/"
          className="group mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-6 py-3 text-sm font-medium text-white shadow-lg shadow-primary/30 transition-all hover:shadow-xl"
        >
          <Home className="size-4" />
          الرئيسية
        </Link>
      </div>
    </main>
  );
}