"use client";

import type { HTMLAttributes } from "react";
import { cn } from "@/components/ui/cn";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-[var(--card)] p-6 shadow-sm ring-1 ring-[var(--card-border)] backdrop-blur",
        className
      )}
      {...props}
    />
  );
}

