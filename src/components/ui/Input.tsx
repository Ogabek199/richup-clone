"use client";

import type { InputHTMLAttributes } from "react";
import { cn } from "@/components/ui/cn";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-xl bg-white/5 px-3 text-sm text-[var(--foreground)]",
        "ring-1 ring-white/12 outline-none placeholder:text-white/35",
        "focus:ring-2 focus:ring-[var(--primary)]/70",
        className
      )}
      {...props}
    />
  );
}

