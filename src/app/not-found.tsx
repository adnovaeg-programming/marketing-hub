import { Sparkles, Home, Search } from "lucide-react";

export default function RootNotFound() {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        style={{
          margin: 0,
          padding: 0,
          fontFamily: "system-ui, sans-serif",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "radial-gradient(ellipse at top, rgba(124, 58, 237, 0.15), transparent 60%), #0b0724",
          color: "#f8fafc",
        }}
      >
        <div
          style={{
            maxWidth: "480px",
            margin: "24px",
            padding: "40px",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "32px",
            textAlign: "center",
            backdropFilter: "blur(20px)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
          }}
        >
          <div
            style={{
              width: "80px",
              height: "80px",
              margin: "0 auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "24px",
              background: "linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)",
              boxShadow: "0 10px 40px rgba(124, 58, 237, 0.4)",
            }}
          >
            <Sparkles size={40} color="#fff" />
          </div>

          <h1
            style={{
              margin: "24px 0 8px",
              fontSize: "72px",
              fontWeight: 700,
              letterSpacing: "-2px",
              background: "linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            404
          </h1>

          <h2 style={{ margin: "0 0 12px", fontSize: "24px", fontWeight: 700 }}>
            الصفحة مش موجودة
          </h2>

          <p
            style={{
              margin: "0 0 32px",
              fontSize: "14px",
              lineHeight: 1.6,
              color: "rgba(248,250,252,0.7)",
            }}
          >
            الصفحة اللي بتدور عليها مش موجودة أو اتنقلت لمكان تاني.
          </p>

          <div
            style={{
              display: "flex",
              gap: "12px",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <a
              href="/ar"
              style={{
                padding: "14px 28px",
                fontSize: "14px",
                fontWeight: 500,
                color: "#fff",
                background: "linear-gradient(to right, #7c3aed, #06b6d4)",
                border: "none",
                borderRadius: "999px",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: "0 10px 30px rgba(124, 58, 237, 0.3)",
              }}
            >
              <Home size={16} />
              الرئيسية
            </a>

            <a
              href="/ar/marketplace"
              style={{
                padding: "14px 28px",
                fontSize: "14px",
                fontWeight: 500,
                color: "#f8fafc",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: "999px",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                backdropFilter: "blur(20px)",
              }}
            >
              <Search size={16} />
              تصفح السوق
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}