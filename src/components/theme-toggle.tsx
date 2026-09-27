"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative size-10 overflow-hidden rounded-full"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="تبديل الوضع"
    >
      {/* الشمس — بتلف وتختفي في الوضع الغامق */}
      <Sun
        className={`
          absolute size-5 transition-all duration-500 ease-in-out
          ${isDark ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"}
        `}
      />

      {/* القمر — بيظهر في الوضع الغامق */}
      <Moon
        className={`
          absolute size-5 transition-all duration-500 ease-in-out
          ${isDark ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"}
        `}
      />
    </Button>
  );
}