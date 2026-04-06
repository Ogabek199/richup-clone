import {
  clampMaxPlayers,
  DEFAULT_MAX_PLAYERS,
  DEFAULT_STARTING_CASH,
  normalizeStartingCash,
} from "@/lib/roomSettings";

export type RoomMeta = {
  hostUid: string;
  maxPlayers: number;
  startingCash: number;
};

export function parseRoomDoc(data: Record<string, unknown>): RoomMeta {
  return {
    hostUid: typeof data.hostUid === "string" ? data.hostUid : "",
    maxPlayers:
      typeof data.maxPlayers === "number" ? clampMaxPlayers(data.maxPlayers) : DEFAULT_MAX_PLAYERS,
    startingCash:
      typeof data.startingCash === "number"
        ? normalizeStartingCash(data.startingCash)
        : DEFAULT_STARTING_CASH,
  };
}

export { DEFAULT_MAX_PLAYERS, DEFAULT_STARTING_CASH };
