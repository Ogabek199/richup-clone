"use client";

import { DEFAULT_TOKEN_COLOR, TOKEN_COLORS } from "@/lib/avatarColors";

type Props = {
  disabled: boolean;
  value: string | undefined;
  onPick: (hex: string) => void;
  label: string;
};

export function TokenPicker({ disabled, value, onPick, label }: Props) {
  const current = value ?? DEFAULT_TOKEN_COLOR;

  return (
    <div className="rounded-2xl bg-white/[0.04] p-4 ring-1 ring-white/10">
      <p className="text-xs font-medium text-white/75">{label}</p>
      <div className="mt-3 grid grid-cols-6 gap-2 sm:grid-cols-6">
        {TOKEN_COLORS.map((hex) => (
          <button
            key={hex}
            className={[
              "flex h-9 w-9 items-center justify-center rounded-full ring-2 transition sm:h-10 sm:w-10",
              current === hex ? "ring-white" : "ring-transparent hover:ring-white/30",
            ].join(" ")}
            disabled={disabled}
            onClick={() => onPick(hex)}
            style={{ backgroundColor: hex }}
            type="button"
            aria-label={hex}
          />
        ))}
      </div>
    </div>
  );
}
