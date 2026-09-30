"use client";

export function SuccessBurst({ active }: { active: boolean }) {
  if (!active) return null;

  const particles = Array.from({ length: 24 });

  return (
    <div className="pointer-events-none absolute inset-0 overflow-visible">
      {particles.map((_, i) => {
        const angle = (i / particles.length) * 360;
        const distance = 80 + Math.random() * 80;
        const tx = Math.cos((angle * Math.PI) / 180) * distance;
        const ty = Math.sin((angle * Math.PI) / 180) * distance;
        const color = i % 3 === 0
          ? "var(--primary)"
          : i % 3 === 1
            ? "var(--accent)"
            : "#ec4899";

        return (
          <span
            key={i}
            className="animate-particle-burst absolute left-1/2 top-1/2 size-2 rounded-full"
            style={{
              background: color,
              boxShadow: `0 0 12px ${color}`,
              ["--tx" as string]: `${tx}px`,
              ["--ty" as string]: `${ty}px`,
              animationDelay: `${Math.random() * 0.15}s`,
            }}
          />
        );
      })}
    </div>
  );
}