"use client";

import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/components/ui/cn";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export function Button({ className, variant = "primary", ...props }: Props) {
  return (
    <button
      className={cn(
        "inline-flex h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-medium transition",
        "disabled:opacity-50 disabled:pointer-events-none",
        variant === "primary" &&
          "bg-[var(--primary)] text-white shadow-sm hover:brightness-110",
        variant === "secondary" &&
          "bg-white/10 text-[var(--foreground)] ring-1 ring-white/15 hover:bg-white/15",
        variant === "ghost" && "bg-transparent text-[var(--foreground)] hover:bg-white/10",
        className
      )}
      {...props}
    />
  );
}

