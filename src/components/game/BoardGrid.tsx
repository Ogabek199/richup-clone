"use client";

import type { ReactNode } from "react";
import { buildPerimeterIndexGrid } from "@/lib/boardLayout";
import {
  BOARD_TILES,
  FLAG_EMOJI,
  tileIconEmoji,
} from "@/lib/boardTiles";
import { cn } from "@/components/ui/cn";

type Props = {
  /** Index 0..39 on the perimeter; multiple tokens can share a cell */
  tokensByCell?: Record<number, string[]>;
  centerSlot?: ReactNode;
};

function TileContent({ index }: { index: number }) {
  const meta = BOARD_TILES[index];
  if (!meta) {
    return <span className="text-[8px] text-white/40">{index}</span>;
  }
  const priceLabel =
    meta.price != null ? `${meta.price} $` : meta.subtitle ?? "";
  const flag = meta.subtitle ? FLAG_EMOJI[meta.subtitle] : null;
  const icon = tileIconEmoji(meta);

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      <div className={cn("h-2 w-full shrink-0 sm:h-2.5", meta.bar)} />
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-0.5 px-0.5 pb-1 pt-1 text-center">
        {flag ? (
          <span className="text-[12px] leading-none sm:text-[14px]" aria-hidden>
            {flag}
          </span>
        ) : icon ? (
          <span className="text-[11px] leading-none sm:text-[13px]" aria-hidden>
            {icon}
          </span>
        ) : null}
        <div className="line-clamp-3 w-full text-[8px] font-bold leading-[1.15] text-white/95 sm:text-[10px]">
          {meta.title}
        </div>
        {priceLabel ? (
          <div className="text-[7px] font-medium text-white/60 sm:text-[8px]">
            {priceLabel}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function BoardGrid({ tokensByCell = {}, centerSlot }: Props) {
  const grid = buildPerimeterIndexGrid();
  const items: React.ReactNode[] = [];

  for (let r = 0; r < 11; r++) {
    for (let c = 0; c < 11; c++) {
      const isPerimeter = r === 0 || r === 10 || c === 0 || c === 10;

      if (isPerimeter) {
        const idx = grid[r][c]!;
        const tokens = tokensByCell[idx] ?? [];
        items.push(
          <div
            key={`p-${r}-${c}-${idx}`}
            className="relative flex aspect-square min-h-[32px] flex-col overflow-hidden rounded-md bg-[#1a1a24] ring-1 ring-white/10 sm:min-h-[40px]"
            style={{ gridRow: r + 1, gridColumn: c + 1 }}
          >
            <TileContent index={idx} />
            {tokens.length > 0 ? (
              <div className="pointer-events-none absolute bottom-0.5 left-0 right-0 flex flex-wrap justify-center gap-0.5">
                {tokens.slice(0, 4).map((color, i) => (
                  <span
                    key={`${idx}-${i}`}
                    className="h-2 w-2 rounded-full ring-1 ring-black/40 sm:h-2.5 sm:w-2.5"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            ) : null}
          </div>,
        );
      } else if (r === 1 && c === 1) {
        items.push(
          <div
            key="center"
            className="flex min-h-[160px] flex-col items-center justify-center gap-2 overflow-y-auto bg-[#0d0d14] p-2 sm:min-h-[200px]"
            style={{ gridRow: "2 / 11", gridColumn: "2 / 11" }}
          >
            {centerSlot}
          </div>,
        );
      }
    }
  }

  return (
    <div className="grid grid-cols-11 grid-rows-11 gap-0.5 rounded-2xl bg-[#0a0a10] p-1 ring-1 ring-white/10 sm:p-1.5">
      {items}
    </div>
  );
}
