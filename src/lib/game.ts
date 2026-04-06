import { z } from "zod";

/** Perimeter tile count (Monopoly-style ring). */
export const BOARD_SIZE = 40;

export const PendingPurchaseSchema = z.object({
  uid: z.string(),
  tileIndex: z.number().int().min(0).max(BOARD_SIZE - 1),
  price: z.number().int().positive(),
});

export const GameStateSchema = z.object({
  status: z.enum(["lobby", "playing", "ended"]).default("lobby"),
  startedAt: z.any().optional(),
  updatedAt: z.any().optional(),
  /** Snapshot of rules when the match started. */
  startingCash: z.number().int().positive().optional(),
  seed: z.string().optional(),
  turnIndex: z.number().int().nonnegative().default(0),
  /** tile index string -> owner uid */
  tileOwners: z.record(z.string(), z.string()).optional(),
  /** tile index string -> upgrade level (0/1), where 1 means 2x rent */
  tileUpgrades: z.record(z.string(), z.number().int().min(0).max(1)).optional(),
  /** Buy / skip before next turn */
  pendingPurchase: PendingPurchaseSchema.nullable().optional(),
  /** Short codes; see `formatGameLogLine` */
  gameLog: z.array(z.string()).max(50).optional(),
  lastRoll: z
    .object({
      uid: z.string(),
      a: z.number().int().min(1).max(6),
      b: z.number().int().min(1).max(6),
      total: z.number().int().min(2).max(12),
      at: z.any().optional(),
    })
    .optional(),
  /** Last rent payment after a roll (for UI; cleared on next roll without rent). */
  lastRent: z
    .object({
      payerUid: z.string(),
      ownerUid: z.string(),
      amount: z.number().int().positive(),
      tileIndex: z.number().int().min(0).max(BOARD_SIZE - 1),
    })
    .nullable()
    .optional(),
});

export type GameState = z.infer<typeof GameStateSchema>;

export const GamePlayerStateSchema = z.object({
  uid: z.string(),
  position: z.number().int().min(0).max(BOARD_SIZE - 1).default(0),
  money: z.number().int().default(1500),
  /** Visiting jail vs in jail — future rules */
  inJail: z.boolean().optional(),
  updatedAt: z.any().optional(),
});

export type GamePlayerState = z.infer<typeof GamePlayerStateSchema>;

