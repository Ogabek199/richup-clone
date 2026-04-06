/** ISO-style codes used in tile subtitles → flag emoji for the board UI */
export const FLAG_EMOJI: Record<string, string> = {
  BR: "🇧🇷",
  IL: "🇮🇱",
  IT: "🇮🇹",
  DE: "🇩🇪",
  CN: "🇨🇳",
  FR: "🇫🇷",
  UK: "🇬🇧",
  US: "🇺🇸",
};

/** Visual metadata for the 40 perimeter tiles (Richup-style layout: index 0 = START bottom-left). */
export type BoardTileKind =
  | "start"
  | "property"
  | "chance"
  | "tax"
  | "airport"
  | "utility"
  | "jail"
  | "vacation"
  | "gotojail";

export type BoardTileMeta = {
  title: string;
  subtitle?: string;
  price?: number;
  /** Top color bar (Tailwind bg-* or hex) */
  bar: string;
  kind: BoardTileKind;
};

/** Emoji icon for non-property tiles (Richup-style). */
export function tileIconEmoji(meta: BoardTileMeta): string {
  if (meta.title === "Surprise") return "❓";
  if (meta.title === "Treasure") return "📦";
  if (meta.kind === "airport") return "✈️";
  if (meta.title.startsWith("Electric")) return "⚡";
  if (meta.title.startsWith("Water")) return "💧";
  if (meta.kind === "tax") return "📋";
  if (meta.kind === "jail") return "🪟";
  if (meta.kind === "vacation") return "🏖️";
  if (meta.kind === "gotojail") return "💀";
  if (meta.kind === "start") return "🟢";
  return "";
}

/** Order matches `buildPerimeterIndexGrid` walk (0 = START). */
export const BOARD_TILES: BoardTileMeta[] = [
  { title: "START", bar: "bg-emerald-600", kind: "start" },
  { title: "Salvador", subtitle: "BR", price: 60, bar: "bg-yellow-500", kind: "property" },
  { title: "Treasure", bar: "bg-amber-700", kind: "chance" },
  { title: "Rio", subtitle: "BR", price: 60, bar: "bg-yellow-500", kind: "property" },
  { title: "Earnings Tax", subtitle: "10%", bar: "bg-slate-600", kind: "tax" },
  { title: "TLV Airport", price: 200, bar: "bg-sky-600", kind: "airport" },
  { title: "Tel Aviv", subtitle: "IL", price: 100, bar: "bg-blue-500", kind: "property" },
  { title: "Surprise", bar: "bg-pink-500", kind: "chance" },
  { title: "Haifa", subtitle: "IL", price: 100, bar: "bg-blue-500", kind: "property" },
  { title: "Jerusalem", subtitle: "IL", price: 120, bar: "bg-blue-600", kind: "property" },
  { title: "In Jail", subtitle: "Passing", bar: "bg-slate-700", kind: "jail" },
  { title: "Venice", subtitle: "IT", price: 140, bar: "bg-emerald-600", kind: "property" },
  { title: "Electric Co.", price: 150, bar: "bg-yellow-400", kind: "utility" },
  { title: "Milan", subtitle: "IT", price: 140, bar: "bg-emerald-600", kind: "property" },
  { title: "Rome", subtitle: "IT", price: 160, bar: "bg-emerald-700", kind: "property" },
  { title: "MUC Airport", price: 200, bar: "bg-sky-600", kind: "airport" },
  { title: "Frankfurt", subtitle: "DE", price: 180, bar: "bg-yellow-600", kind: "property" },
  { title: "Treasure", bar: "bg-amber-700", kind: "chance" },
  { title: "Munich", subtitle: "DE", price: 180, bar: "bg-yellow-600", kind: "property" },
  { title: "Berlin", subtitle: "DE", price: 200, bar: "bg-yellow-700", kind: "property" },
  { title: "Vacation", subtitle: "$0", bar: "bg-cyan-600", kind: "vacation" },
  { title: "Shenzhen", subtitle: "CN", price: 220, bar: "bg-red-600", kind: "property" },
  { title: "Surprise", bar: "bg-pink-500", kind: "chance" },
  { title: "Beijing", subtitle: "CN", price: 220, bar: "bg-red-600", kind: "property" },
  { title: "Shanghai", subtitle: "CN", price: 240, bar: "bg-red-700", kind: "property" },
  { title: "CDG Airport", price: 200, bar: "bg-sky-600", kind: "airport" },
  { title: "Lyon", subtitle: "FR", price: 260, bar: "bg-indigo-500", kind: "property" },
  { title: "Toulouse", subtitle: "FR", price: 260, bar: "bg-indigo-500", kind: "property" },
  { title: "Water Co.", price: 150, bar: "bg-cyan-500", kind: "utility" },
  { title: "Paris", subtitle: "FR", price: 280, bar: "bg-indigo-600", kind: "property" },
  { title: "Go to jail", bar: "bg-zinc-800", kind: "gotojail" },
  { title: "Liverpool", subtitle: "UK", price: 300, bar: "bg-rose-600", kind: "property" },
  { title: "Manchester", subtitle: "UK", price: 300, bar: "bg-rose-600", kind: "property" },
  { title: "Treasure", bar: "bg-amber-700", kind: "chance" },
  { title: "London", subtitle: "UK", price: 320, bar: "bg-rose-700", kind: "property" },
  { title: "JFK Airport", price: 200, bar: "bg-sky-600", kind: "airport" },
  { title: "Surprise", bar: "bg-pink-500", kind: "chance" },
  { title: "San Francisco", subtitle: "US", price: 350, bar: "bg-violet-600", kind: "property" },
  { title: "Premium Tax", subtitle: "$75", bar: "bg-slate-600", kind: "tax" },
  { title: "New York", subtitle: "US", price: 400, bar: "bg-violet-700", kind: "property" },
];
