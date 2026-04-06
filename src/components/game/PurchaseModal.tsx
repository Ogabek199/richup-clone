"use client";

import { BOARD_TILES } from "@/lib/boardTiles";
import { Button } from "@/components/ui/Button";

type Props = {
  open: boolean;
  tileIndex: number;
  priceLabel: string;
  title: string;
  hint: string;
  buyLabel: string;
  declineLabel: string;
  busy: boolean;
  onBuy: () => void;
  onDecline: () => void;
};

export function PurchaseModal({
  open,
  tileIndex,
  priceLabel,
  title,
  hint,
  buyLabel,
  declineLabel,
  busy,
  onBuy,
  onDecline,
}: Props) {
  if (!open) return null;
  const meta = BOARD_TILES[tileIndex];

  return (
    <div
      className="fixed inset-0 z-[190] flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-md rounded-2xl bg-[#15151f] p-6 ring-1 ring-white/15 shadow-2xl">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        <p className="mt-3 text-2xl font-bold tracking-tight text-emerald-300/95">
          {meta?.title ?? `#${tileIndex}`}
        </p>
        <p className="mt-1 text-sm font-medium text-white/75">{priceLabel}</p>
        <p className="mt-2 text-sm text-white/55">{hint}</p>
        <div className="mt-6 flex flex-wrap gap-2">
          <Button
            className="min-h-11 flex-1"
            disabled={busy}
            onClick={onBuy}
            type="button"
          >
            {buyLabel}
          </Button>
          <Button
            className="min-h-11 flex-1"
            disabled={busy}
            onClick={onDecline}
            type="button"
            variant="secondary"
          >
            {declineLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
