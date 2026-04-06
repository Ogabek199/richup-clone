"use client";

import { useEffect, useState } from "react";
import { cn } from "@/components/ui/cn";

function DieFace({
  value,
  rolling,
}: {
  value: number;
  rolling?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex h-11 w-11 items-center justify-center rounded-lg bg-white text-lg font-bold text-slate-900 shadow-inner ring-1 ring-black/10 sm:h-14 sm:w-14 sm:text-2xl",
        rolling && "animate-pulse shadow-[0_0_20px_rgba(255,255,255,0.35)]"
      )}
    >
      {value}
    </div>
  );
}

export function DiceDisplay({
  a,
  b,
  placeholder,
  rolling,
}: {
  a?: number;
  b?: number;
  placeholder?: boolean;
  /** Client-side rolling animation before server result */
  rolling?: boolean;
}) {
  const [ra, setRa] = useState(1);
  const [rb, setRb] = useState(1);

  useEffect(() => {
    if (!rolling) return;
    const id = window.setInterval(() => {
      setRa(1 + Math.floor(Math.random() * 6));
      setRb(1 + Math.floor(Math.random() * 6));
    }, 70);
    return () => window.clearInterval(id);
  }, [rolling]);

  const showPh = placeholder || (a == null && b == null && !rolling);
  const displayA = rolling ? ra : showPh ? 1 : a ?? 1;
  const displayB = rolling ? rb : showPh ? 1 : b ?? 1;

  return (
    <div className="flex items-center gap-3 sm:gap-4">
      <DieFace rolling={rolling} value={displayA} />
      <DieFace rolling={rolling} value={displayB} />
    </div>
  );
}
