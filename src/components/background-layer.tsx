export function BackgroundLayer() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-50 overflow-hidden"
    >
      {/* Purple glow — top right */}
      <div className="animate-glow-pulse absolute -top-40 -right-40 size-[600px] rounded-full bg-primary/25 blur-[120px]" />

      {/* Cyan glow — bottom left */}
      <div
        className="animate-glow-pulse absolute -bottom-40 -left-40 size-[600px] rounded-full bg-accent/20 blur-[120px]"
        style={{ animationDelay: "1.5s" }}
      />

      {/* Soft purple — center */}
      <div className="absolute top-1/3 left-1/2 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-primary/[0.08] blur-[100px]" />

      {/* Subtle grid */}
      <div className="subtle-grid absolute inset-0 opacity-[0.015] dark:opacity-[0.03]" />
    </div>
  );
}