import { BOARD_TILES, type BoardTileMeta } from "@/lib/boardTiles";
import { BOARD_SIZE } from "@/lib/game";

export const JAIL_TILE_INDEX = BOARD_TILES.findIndex((t) => t.kind === "jail");
export const GO_TO_JAIL_TILE_INDEX = BOARD_TILES.findIndex((t) => t.kind === "gotojail");

export function computeRent(price: number): number {
  return Math.max(10, Math.floor(price * 0.2));
}

export type LandingOutcome = {
  advanceTurn: boolean;
  pendingPurchase?: { tileIndex: number; price: number };
  logLines: string[];
  /** Applied to the landing player */
  moneyDelta: number;
  /** If set, player moves here (e.g. jail) */
  positionOverride?: number;
  /** Rent paid to this player */
  payToUid?: string;
  rentAmount?: number;
};

function treasureAmount(a: number, b: number, tileIndex: number): number {
  const n = (a * 6 + b + tileIndex * 3) % 16;
  return 50 + n * 10;
}

function surpriseOutcome(
  a: number,
  b: number,
  tileIndex: number
): { moneyDelta: number; positionOverride?: number; logKey: string } {
  const idx = (a * 11 + b * 13 + tileIndex * 17) % 5;
  switch (idx) {
    case 0:
      return { moneyDelta: -100, logKey: "surprisePay100" };
    case 1:
      return { moneyDelta: 150, logKey: "surpriseGain150" };
    case 2:
      return {
        moneyDelta: 0,
        positionOverride: JAIL_TILE_INDEX,
        logKey: "surpriseJail",
      };
    case 3:
      return { moneyDelta: -50, logKey: "surpriseFine50" };
    default:
      return { moneyDelta: 75, logKey: "surpriseGain75" };
  }
}

export function resolveLanding(params: {
  tileIndex: number;
  tile: BoardTileMeta;
  meUid: string;
  myMoney: number;
  tileOwners: Record<string, string>;
  tileUpgrades?: Record<string, number>;
  /** Dice values — used for deterministic “random” cards */
  diceA: number;
  diceB: number;
}): LandingOutcome {
  const {
    tileIndex,
    tile,
    meUid,
    myMoney,
    tileOwners: owners,
    tileUpgrades,
    diceA,
    diceB,
  } = params;
  const key = String(tileIndex);
  const owner = owners[key];

  if (tile.kind === "gotojail") {
    return {
      advanceTurn: true,
      logLines: ["gotojail"],
      moneyDelta: 0,
      positionOverride: JAIL_TILE_INDEX,
    };
  }

  if (tile.kind === "tax") {
    const pay =
      tile.title.includes("Earnings") || tile.title.includes("10%")
        ? Math.min(200, Math.floor(myMoney * 0.1))
        : 75;
    return {
      advanceTurn: true,
      logLines: [
        tile.title.includes("Earnings") || tile.title.includes("10%")
          ? `taxEarnings:${pay}`
          : `taxPremium:${pay}`,
      ],
      moneyDelta: -pay,
    };
  }

  if (tile.title === "Treasure") {
    const gain = treasureAmount(diceA, diceB, tileIndex);
    return {
      advanceTurn: true,
      logLines: [`treasure:${gain}`],
      moneyDelta: gain,
    };
  }

  if (tile.title === "Surprise") {
    const s = surpriseOutcome(diceA, diceB, tileIndex);
    return {
      advanceTurn: true,
      logLines: [`surprise:${s.logKey}`],
      moneyDelta: s.moneyDelta,
      positionOverride: s.positionOverride,
    };
  }

  if (
    tile.kind === "vacation" ||
    tile.kind === "jail" ||
    tile.kind === "start"
  ) {
    return { advanceTurn: true, logLines: [], moneyDelta: 0 };
  }

  if (
    tile.price != null &&
    (tile.kind === "property" ||
      tile.kind === "airport" ||
      tile.kind === "utility")
  ) {
    if (!owner) {
      if (myMoney >= tile.price) {
        return {
          advanceTurn: false,
          pendingPurchase: { tileIndex, price: tile.price },
          logLines: [`landOffer:${tileIndex}`],
          moneyDelta: 0,
        };
      }
      return {
        advanceTurn: true,
        logLines: [`cantAfford:${tileIndex}`],
        moneyDelta: 0,
      };
    }
    if (owner === meUid) {
      return {
        advanceTurn: true,
        logLines: [`ownLand:${tileIndex}`],
        moneyDelta: 0,
      };
    }
    const baseRent = computeRent(tile.price);
    const lvl = Math.max(0, Math.min(1, tileUpgrades?.[key] ?? 0));
    const mult = lvl >= 1 ? 2 : 1;
    const rent = baseRent * mult;
    return {
      advanceTurn: true,
      logLines: [`payRent:${owner}:${rent}:${tileIndex}`],
      moneyDelta: -rent,
      payToUid: owner,
      rentAmount: rent,
    };
  }

  return { advanceTurn: true, logLines: [], moneyDelta: 0 };
}

/** GO bonus when moving (not when landing effects). */
export function crossedGoBonus(oldPos: number, totalDice: number): number {
  return oldPos + totalDice >= BOARD_SIZE ? 200 : 0;
}
