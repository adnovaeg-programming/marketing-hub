"use client";

import { useEffect, useState } from "react";

const CHARS = "!<>-_\\/[]{}—=+*^?#________";

export function TextScramble({
  text,
  className = "",
  duration = 1200,
  autoStart = true,
}: {
  text: string;
  className?: string;
  duration?: number;
  autoStart?: boolean;
}) {
  const [output, setOutput] = useState(text);

  useEffect(() => {
    if (!autoStart) return;

    let frame = 0;
    const totalFrames = Math.floor(duration / 30);
    let raf: number;

    const animate = () => {
      frame++;
      const progress = frame / totalFrames;
      const revealedLength = Math.floor(progress * text.length);

      const next = text
        .split("")
        .map((char, i) => {
          if (char === " ") return " ";
          if (i < revealedLength) return char;
          return CHARS[Math.floor(Math.random() * CHARS.length)];
        })
        .join("");

      setOutput(next);

      if (frame < totalFrames) {
        raf = requestAnimationFrame(animate);
      } else {
        setOutput(text);
      }
    };

    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [text, duration, autoStart]);

  return <span className={className}>{output}</span>;
}