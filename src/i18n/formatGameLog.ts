import { BOARD_TILES } from "@/lib/boardTiles";

function tileName(indexStr: string): string {
  const i = Number.parseInt(indexStr, 10);
  if (Number.isNaN(i) || !BOARD_TILES[i]) return indexStr;
  return BOARD_TILES[i].title;
}

/**
 * Parses `gameLog` codes from Firestore into localized strings.
 */
export function formatGameLogLine(
  line: string,
  t: (key: string, params?: Record<string, string | number>) => string,
  resolvePlayerName?: (uid: string) => string
): string {
  const parts = line.split(":");
  const code = parts[0];

  if (code === "roll" && parts.length >= 4) {
    return t("room.log.roll", { a: parts[1], b: parts[2], total: parts[3] });
  }
  if (code === "passGo") {
    return t("room.log.passGo", { amount: parts[1] ?? "200" });
  }
  if (code === "gotojail") {
    return t("room.log.gotojail");
  }
  if (code === "taxEarnings" && parts[1]) {
    return t("room.log.taxEarnings", { amount: parts[1] });
  }
  if (code === "taxPremium" && parts[1]) {
    return t("room.log.taxPremium", { amount: parts[1] });
  }
  if (code === "treasure" && parts[1]) {
    return t("room.log.treasure", { amount: parts[1] });
  }
  if (code === "surprise" && parts[1]) {
    const k = `room.log.surprise.${parts[1]}`;
    const translated = t(k);
    return translated === k ? line : translated;
  }
  if (code === "landOffer" && parts[1]) {
    return t("room.log.landOffer", { place: tileName(parts[1]) });
  }
  if (code === "cantAfford" && parts[1]) {
    return t("room.log.cantAfford", { place: tileName(parts[1]) });
  }
  if (code === "ownLand" && parts[1]) {
    return t("room.log.ownLand", { place: tileName(parts[1]) });
  }
  if (code === "payRent" && parts.length >= 4) {
    const player =
      resolvePlayerName?.(parts[1]) ?? parts[1].slice(0, 8);
    return t("room.log.payRent", {
      amount: parts[2],
      place: tileName(parts[3]),
      player,
    });
  }
  if (code === "blockedBuy" && parts[1]) {
    return t("room.log.blockedBuy", { place: tileName(parts[1]) });
  }
  if (code === "upgrade2x" && parts[1]) {
    return t("room.log.upgrade2x", { place: tileName(parts[1]) });
  }
  if (code === "bought" && parts[1]) {
    return t("room.log.bought", { place: tileName(parts[1]) });
  }
  if (code === "declined" && parts[1]) {
    return t("room.log.declined", { place: tileName(parts[1]) });
  }

  return line;
}
