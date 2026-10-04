"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";

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
    <html lang="ar" dir="rtl">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif" }}>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            background:
              "radial-gradient(ellipse at top, rgba(124, 58, 237, 0.15), transparent 60%), #0b0724",
            color: "#f8fafc",
          }}
        >
          <div
            style={{
              maxWidth: "440px",
              padding: "32px",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "24px",
              textAlign: "center",
              backdropFilter: "blur(20px)",
            }}
          >
            <div
              style={{
                width: "64px",
                height: "64px",
                margin: "0 auto 24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "20px",
                background: "linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)",
              }}
            >
              <AlertTriangle size={32} color="#fff" />
            </div>

            <h2 style={{ margin: "0 0 8px", fontSize: "24px" }}>
              حصلت مشكلة
            </h2>
            <p
              style={{
                margin: "0 0 24px",
                fontSize: "14px",
                color: "rgba(248,250,252,0.7)",
              }}
            >
              حصل خطأ غير متوقع. جرّب تحديث الصفحة.
            </p>

            {error.digest && (
              <p
                style={{
                  margin: "0 0 24px",
                  padding: "8px",
                  fontSize: "11px",
                  fontFamily: "monospace",
                  background: "rgba(255,255,255,0.05)",
                  borderRadius: "8px",
                  color: "rgba(248,250,252,0.5)",
                }}
              >
                {error.digest}
              </p>
            )}

            <div
              style={{
                display: "flex",
                gap: "8px",
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <button
                onClick={reset}
                style={{
                  padding: "12px 24px",
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "#fff",
                  background: "linear-gradient(to right, #7c3aed, #06b6d4)",
                  border: "none",
                  borderRadius: "999px",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <RotateCcw size={16} />
                حاول تاني
              </button>
              <a
                href="/ar"
                style={{
                  padding: "12px 24px",
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "#f8fafc",
                  background: "transparent",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: "999px",
                  cursor: "pointer",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <Home size={16} />
                الرئيسية
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}