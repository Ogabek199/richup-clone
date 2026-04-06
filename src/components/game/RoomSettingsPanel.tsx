"use client";

import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import type { Firestore } from "firebase/firestore";
import { MAX_ROOM_PLAYERS } from "@/lib/constants";
import {
  clampMaxPlayers,
  MIN_ROOM_PLAYERS,
  STARTING_CASH_OPTIONS,
} from "@/lib/roomSettings";

type Props = {
  db: Firestore;
  roomId: string;
  isHost: boolean;
  lobby: boolean;
  currentPlayerCount: number;
  maxPlayers: number;
  startingCash: number;
  labels: {
    title: string;
    maxPlayers: string;
    maxPlayersHint: string;
    startingCash: string;
    startingCashHint: string;
    hostOnly: string;
    lockedAfterStart: string;
    capBelowPlayers: string;
  };
};

export function RoomSettingsPanel({
  db,
  roomId,
  isHost,
  lobby,
  currentPlayerCount,
  maxPlayers,
  startingCash,
  labels,
}: Props) {
  const [busy, setBusy] = useState(false);

  async function persist(next: { maxPlayers?: number; startingCash?: number }) {
    if (!isHost || !lobby) return;
    if (typeof next.maxPlayers === "number") {
      const v = clampMaxPlayers(next.maxPlayers);
      if (v < currentPlayerCount) {
        window.alert(labels.capBelowPlayers);
        return;
      }
    }
    setBusy(true);
    try {
      const payload: Record<string, number> = {};
      if (typeof next.maxPlayers === "number") {
        payload.maxPlayers = clampMaxPlayers(next.maxPlayers);
      }
      if (typeof next.startingCash === "number") {
        payload.startingCash = next.startingCash;
      }
      if (Object.keys(payload).length === 0) return;
      await updateDoc(doc(db, "rooms", roomId), payload);
    } finally {
      setBusy(false);
    }
  }

  const controlsLocked = !lobby;
  const selectDisabled = !isHost || busy || controlsLocked;

  return (
    <div className="rounded-2xl bg-white/[0.04] p-4 ring-1 ring-white/10">
      <h3 className="text-sm font-semibold text-white/90">{labels.title}</h3>
      {controlsLocked ? (
        <p className="mt-2 text-xs text-white/45">{labels.lockedAfterStart}</p>
      ) : !isHost ? (
        <p className="mt-2 text-xs text-white/45">{labels.hostOnly}</p>
      ) : null}

      <div className="mt-4 space-y-4">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-white/70">{labels.maxPlayers}</span>
          <span className="text-[11px] text-white/40">{labels.maxPlayersHint}</span>
          <select
            className="h-11 rounded-xl bg-white/5 px-3 text-sm text-[var(--foreground)] ring-1 ring-white/12 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/70 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={selectDisabled}
            value={maxPlayers}
            onChange={(e) => void persist({ maxPlayers: Number(e.target.value) })}
          >
            {Array.from(
              { length: MAX_ROOM_PLAYERS - MIN_ROOM_PLAYERS + 1 },
              (_, i) => i + MIN_ROOM_PLAYERS
            ).map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-white/70">{labels.startingCash}</span>
          <span className="text-[11px] text-white/40">{labels.startingCashHint}</span>
          <select
            className="h-11 rounded-xl bg-white/5 px-3 text-sm text-[var(--foreground)] ring-1 ring-white/12 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/70 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={selectDisabled}
            value={startingCash}
            onChange={(e) => void persist({ startingCash: Number(e.target.value) })}
          >
            {STARTING_CASH_OPTIONS.map((n) => (
              <option key={n} value={n}>
                ${n.toLocaleString()}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}
