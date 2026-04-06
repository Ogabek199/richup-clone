import { z } from "zod";

export const RoomSchema = z.object({
  id: z.string(),
  createdAt: z.any().optional(),
  hostUid: z.string(),
  status: z.enum(["lobby", "playing", "ended"]).default("lobby"),
  maxPlayers: z.number().int().min(2).max(6).optional(),
  startingCash: z.number().int().positive().optional(),
});

export type Room = z.infer<typeof RoomSchema>;

export const PlayerSchema = z.object({
  uid: z.string(),
  displayName: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  /** Hex color for token on the board */
  tokenColor: z.string().optional(),
  joinedAt: z.any().optional(),
  lastSeenAt: z.any().optional(),
  leftAt: z.any().optional(),
});

export type Player = z.infer<typeof PlayerSchema>;

