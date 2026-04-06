"use client";

import { TOKEN_COLORS } from "@/lib/avatarColors";

type Props = {
  open: boolean;
  title: string;
  hint: string;
  onPick: (hex: string) => void;
};

export function TokenJoinModal({ open, title, hint, onPick }: Props) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="token-modal-title"
    >
      <div className="w-full max-w-sm rounded-2xl bg-[#15151f] p-6 ring-1 ring-white/15 shadow-2xl">
        <h2 id="token-modal-title" className="text-lg font-semibold text-white">
          {title}
        </h2>
        <p className="mt-2 text-sm text-white/55">{hint}</p>
        <div className="mt-5 grid grid-cols-6 gap-2">
          {TOKEN_COLORS.map((hex) => (
            <button
              key={hex}
              className="flex h-10 w-10 items-center justify-center rounded-full ring-2 ring-transparent transition hover:ring-white/40"
              onClick={() => onPick(hex)}
              style={{ backgroundColor: hex }}
              type="button"
              aria-label={hex}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
