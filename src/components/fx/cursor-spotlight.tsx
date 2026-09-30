"use client";

import { useEffect, useRef, useState } from "react";

export function CursorSpotlight() {
  const ref = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    // احترام prefers-reduced-motion
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setEnabled(!mq.matches);

    // مايشتغلش على الموبايل
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    if (isTouch) setEnabled(false);

    const el = ref.current;
    if (!el || !enabled) return;

    let raf = 0;
    const handleMove = (e: MouseEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.setProperty("--x", `${e.clientX}px`);
        el.style.setProperty("--y", `${e.clientY}px`);
      });
    };

    window.addEventListener("mousemove", handleMove, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", handleMove);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      {/* Primary glow */}
      <div
        ref={ref}
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 hidden lg:block"
        style={{
          background:
            "radial-gradient(circle 700px at var(--x, 50%) var(--y, 50%), color-mix(in oklch, var(--primary) 14%, transparent), transparent 85%)",
        }}
      />

      {/* Accent glow (offset) */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 hidden lg:block"
        style={{
          background:
            "radial-gradient(circle 400px at var(--x, 50%) var(--y, 50%), color-mix(in oklch, var(--accent) 8%, transparent), transparent 80%)",
        }}
      />
    </>
  );
}