export const PLATFORM_BADGES: Record<
  string,
  { label: string; className: string }
> = {
  instagram: {
    label: "IG",
    className: "bg-gradient-to-br from-pink-500 to-purple-600 text-white",
  },
  facebook: {
    label: "FB",
    className: "bg-blue-600 text-white",
  },
  tiktok: {
    label: "TT",
    className: "bg-black text-white",
  },
  x: {
    label: "X",
    className: "bg-black text-white",
  },
  linkedin: {
    label: "in",
    className: "bg-[#0A66C2] text-white",
  },
  youtube: {
    label: "YT",
    className: "bg-red-600 text-white",
  },
  threads: {
    label: "@",
    className: "bg-black text-white",
  },
  pinterest: {
    label: "P",
    className: "bg-[#E60023] text-white",
  },
};

export const PLATFORM_LABELS: Record<string, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  tiktok: "TikTok",
  x: "X",
  linkedin: "LinkedIn",
  youtube: "YouTube",
  threads: "Threads",
  pinterest: "Pinterest",
};

export function PlatformBadge({
  platform,
  size = "md",
}: {
  platform: string;
  size?: "sm" | "md" | "lg";
}) {
  const badge = PLATFORM_BADGES[platform];
  if (!badge) return null;

  const sizeClasses = {
    sm: "size-6 text-[9px] rounded-md",
    md: "size-10 text-xs rounded-xl",
    lg: "size-12 text-sm rounded-2xl",
  };

  return (
    <div
      className={`flex shrink-0 items-center justify-center font-bold shadow-lg ${sizeClasses[size]} ${badge.className}`}
    >
      {badge.label}
    </div>
  );
}