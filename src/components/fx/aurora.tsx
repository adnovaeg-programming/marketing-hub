export function Aurora() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      {/* Aurora band 1 */}
      <div className="bg-aurora absolute -top-40 left-0 h-[400px] w-full opacity-60" />

      {/* Aurora band 2 — reversed */}
      <div
        className="bg-aurora absolute -bottom-40 left-0 h-[400px] w-full opacity-40"
        style={{ animationDelay: "5s", animationDirection: "reverse" }}
      />

      {/* Floating orbs */}
      <div
        className="float-layer absolute top-1/4 right-[10%] size-32 bg-gradient-to-br from-primary/40 to-accent/40 opacity-50 blur-3xl"
        style={{ borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%" }}
      />
      <div
        className="float-layer absolute bottom-1/3 left-[15%] size-24 bg-gradient-to-tr from-accent/40 to-primary/40 opacity-40 blur-3xl"
        style={{
          borderRadius: "30% 70% 70% 30% / 30% 30% 70% 70%",
          animationDelay: "2s",
        }}
      />
    </div>
  );
}