import { MAX_ROOM_PLAYERS } from "@/lib/constants";

export const MIN_ROOM_PLAYERS = 2;
export const MIN_PLAYERS_TO_START = 2;

/** Preset starting cash options ($) — Richup-style defaults. */
export const STARTING_CASH_OPTIONS = [1000, 1500, 2000, 2500, 3000] as const;

export const DEFAULT_MAX_PLAYERS = 4;
export const DEFAULT_STARTING_CASH = 2000;

export function clampMaxPlayers(n: number): number {
  return Math.min(MAX_ROOM_PLAYERS, Math.max(MIN_ROOM_PLAYERS, Math.round(n)));
}

export function normalizeStartingCash(n: number): number {
  const allowed = new Set<number>(STARTING_CASH_OPTIONS);
  if (allowed.has(n)) return n;
  return DEFAULT_STARTING_CASH;
}
