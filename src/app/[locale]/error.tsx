"use client";

import { useEffect } from "react";
import { AlertCircle, RotateCcw, Home } from "lucide-react";

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Locale error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="glass-strong mx-auto max-w-md rounded-3xl p-8 text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-destructive/10">
          <AlertCircle className="size-8 text-destructive" />
        </div>
        <h2 className="mt-6 text-2xl font-bold">حصلت مشكلة</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          حصل خطأ غير متوقع. جرّب تاني.
        </p>
        {error.digest && (
          <p className="mt-3 rounded-lg bg-muted/40 p-2 font-mono text-[10px] text-muted-foreground">
            {error.digest}
          </p>
        )}

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-primary/30 transition hover:shadow-xl"
          >
            <RotateCcw className="size-4" />
            حاول تاني
          </button>
          <a
            href="/ar/dashboard"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-medium transition hover:bg-muted/50"
          >
            <Home className="size-4" />
            الرئيسية
          </a>
        </div>
      </div>
    </div>
  );
}