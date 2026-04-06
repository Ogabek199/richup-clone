"use client";

import { useMemo } from "react";
import { DiceDisplay } from "@/components/game/DiceDisplay";
import type { GameState } from "@/lib/game";
import { useI18n } from "@/i18n/I18nProvider";
import { formatGameLogLine } from "@/i18n/formatGameLog";

type Props = {
  lobby: boolean;
  game: GameState | null;
  roomId: string;
  hostDisplayName: string;
  diceRolling?: boolean;
  resolvePlayerName?: (uid: string) => string;
};

export function BoardCenter({
  lobby,
  game,
  roomId,
  hostDisplayName,
  diceRolling,
  resolvePlayerName,
}: Props) {
  const { t } = useI18n();

  const logLines = useMemo(() => {
    const raw = game?.gameLog ?? [];
    return raw
      .slice(-12)
      .map((line) => formatGameLogLine(line, t, resolvePlayerName));
  }, [game?.gameLog, t, resolvePlayerName]);

  if (lobby) {
    return (
      <div className="flex max-w-[min(100%,300px)] flex-col items-center gap-3 px-2 text-center">
        <DiceDisplay placeholder />
        <p className="text-xs leading-snug text-white/60 sm:text-sm">
          {t("room.waitForHostStart", { name: hostDisplayName })}
        </p>
        <p className="text-[10px] text-white/35 sm:text-[11px]">
          {t("room.joinedRoom", { roomId })}
        </p>
      </div>
    );
  }

  const lr = game?.lastRoll;
  const showPlaceholder = lr == null && !diceRolling;

  return (
    <div className="flex w-full max-w-[min(100%,320px)] flex-col items-center gap-3 px-1 text-center">
      <DiceDisplay
        a={lr?.a}
        b={lr?.b}
        placeholder={showPlaceholder}
        rolling={diceRolling}
      />
      {diceRolling ? (
        <p className="text-xs text-violet-300/90">{t("room.rollingDice")}</p>
      ) : lr ? null : (
        <p className="text-xs text-white/45">{t("room.noRollYet")}</p>
      )}

      {logLines.length > 0 ? (
        <div className="w-full rounded-xl bg-black/25 px-2 py-2 text-left ring-1 ring-white/10">
          <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-white/40">
            {t("room.gameLogTitle")}
          </div>
          <ul className="max-h-[100px] space-y-1 overflow-y-auto text-[10px] leading-snug text-white/65 sm:max-h-[120px] sm:text-[11px]">
            {logLines.map((line, i) => (
              <li key={`${i}-${line.slice(0, 12)}`}>{line}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
