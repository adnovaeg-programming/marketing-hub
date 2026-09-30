"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="flex min-h-screen items-center justify-center bg-background p-6">
          <div className="glass-strong mx-auto max-w-md rounded-3xl p-8 text-center">
            <h2 className="text-2xl font-bold">حصلت مشكلة</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              حصل خطأ غير متوقع. جرّب تاني.
            </p>
            <button
              onClick={reset}
              className="mt-6 rounded-full bg-gradient-to-r from-primary to-accent px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-primary/30"
            >
              حاول تاني
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}