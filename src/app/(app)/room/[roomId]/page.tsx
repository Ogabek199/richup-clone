"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  runTransaction,
  query,
  serverTimestamp,
  setDoc,
  orderBy,
  updateDoc,
  type Unsubscribe,
} from "firebase/firestore";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/ToastProvider";
import type { Firestore } from "firebase/firestore";
import { getDb, isFirebaseConfigured } from "@/lib/firebase";
import { MAX_ROOM_PLAYERS } from "@/lib/constants";
import { copyToClipboard } from "@/lib/clipboard";
import type { Player } from "@/lib/room";
import {
  BOARD_SIZE,
  type GamePlayerState,
  type GameState,
} from "@/lib/game";
import { BOARD_TILES } from "@/lib/boardTiles";
import { crossedGoBonus, resolveLanding } from "@/lib/landTile";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useI18n } from "@/i18n/I18nProvider";
import { LanguageToggleBox } from "@/components/LanguageToggleBox";
import { BoardGrid } from "@/components/game/BoardGrid";
import { BoardCenter } from "@/components/game/BoardCenter";
import { TokenJoinModal } from "@/components/game/TokenJoinModal";
import { PurchaseModal } from "@/components/game/PurchaseModal";
import { RoomSettingsPanel } from "@/components/game/RoomSettingsPanel";
import { parseRoomDoc, type RoomMeta } from "@/lib/parseRoomDoc";
import {
  DEFAULT_STARTING_CASH,
  MIN_PLAYERS_TO_START,
} from "@/lib/roomSettings";

export default function RoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const router = useRouter();
  const { pushToast } = useToast();
  const { user } = useAuth();
  const { t } = useI18n();

  const [players, setPlayers] = useState<Player[]>([]);
  const [game, setGame] = useState<GameState | null>(null);
  const [gamePlayers, setGamePlayers] = useState<Record<string, GamePlayerState>>({});
  const [roomMeta, setRoomMeta] = useState<RoomMeta | null>(null);
  const [status, setStatus] = useState<"idle" | "ready">("idle");
  const [copied, setCopied] = useState(false);
  const [actionBusy, setActionBusy] = useState(false);
  const [diceRolling, setDiceRolling] = useState(false);
  const db = useMemo(() => getDb(), []);
  const configuredDb = db as Firestore | null;

  const inviteUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/room/${roomId}`;
  }, [roomId]);

  const upsertPresence = useCallback(async () => {
    if (!user) return;
    const dbx = configuredDb;
    if (!dbx) throw new Error("Firestore is not available.");
    const ref = doc(dbx, "rooms", roomId, "players", user.uid);
    await setDoc(
      ref,
      {
        uid: user.uid,
        displayName: user.displayName ?? null,
        email: user.email ?? null,
        joinedAt: serverTimestamp(),
        lastSeenAt: serverTimestamp(),
        leftAt: null,
      },
      { merge: true }
    );
  }, [roomId, user, configuredDb]);

  useEffect(() => {
    if (!user) return;
    const dbx = configuredDb;
    if (!isFirebaseConfigured() || !dbx) {
      pushToast("Firebase is not configured (.env.local missing) or Firestore unavailable.");
      setStatus("ready");
      return;
    }
    const firestore: Firestore = dbx;

    let unsubRoom: Unsubscribe | null = null;
    let unsubPlayers: Unsubscribe | null = null;
    let unsubGame: Unsubscribe | null = null;
    let unsubGamePlayers: Unsubscribe | null = null;
    let interval: number | null = null;
    let cancelled = false;

    async function run() {
      try {
        const roomSnap = await getDoc(doc(firestore, "rooms", roomId));
        if (!roomSnap.exists()) {
          pushToast("Room not found.");
          setStatus("ready");
          return;
        }
        const meta = parseRoomDoc(roomSnap.data() as Record<string, unknown>);
        setRoomMeta(meta);

        const playersSnap = await getDocs(collection(firestore, "rooms", roomId, "players"));
        const listed: Player[] = [];
        playersSnap.forEach((d) => listed.push(d.data() as Player));
        const active = listed.filter((p) => !p.leftAt);
        const meIn = user ? active.some((p) => p.uid === user.uid) : false;
        if (active.length >= meta.maxPlayers && !meIn) {
          pushToast("Room is full.");
          router.replace("/lobby");
          return;
        }

        await upsertPresence();
        if (cancelled) return;

        unsubRoom = onSnapshot(
          doc(firestore, "rooms", roomId),
          (snap) => {
            if (!snap.exists()) {
              pushToast("Room not found.");
              setStatus("ready");
              return;
            }
            setRoomMeta(parseRoomDoc(snap.data() as Record<string, unknown>));
            setStatus("ready");
          },
          (e) => {
            pushToast(e.message);
            setStatus("ready");
          }
        );

        unsubPlayers = onSnapshot(
          query(
            collection(firestore, "rooms", roomId, "players"),
            orderBy("joinedAt", "asc")
          ),
          (snap) => {
            const nextPlayers: Player[] = [];
            snap.forEach((d) => nextPlayers.push(d.data() as Player));
            setPlayers(nextPlayers.filter((p) => !p.leftAt));
          },
          (e) => pushToast(e.message)
        );

        unsubGame = onSnapshot(
          doc(firestore, "rooms", roomId, "game", "state"),
          (snap) => {
            setGame(snap.exists() ? (snap.data() as GameState) : null);
          },
          (e) => pushToast(e.message)
        );

        unsubGamePlayers = onSnapshot(
          collection(firestore, "rooms", roomId, "game", "state", "players"),
          (snap) => {
            const next: Record<string, GamePlayerState> = {};
            snap.forEach((d) => {
              next[d.id] = d.data() as GamePlayerState;
            });
            setGamePlayers(next);
          },
          (e) => pushToast(e.message)
        );

        interval = window.setInterval(() => {
          if (!user) return;
          void updateDoc(doc(firestore, "rooms", roomId, "players", user.uid), {
            lastSeenAt: serverTimestamp(),
          });
        }, 10_000);
      } catch (e: unknown) {
        pushToast(e instanceof Error ? e.message : "Failed to join room");
        setStatus("ready");
      }
    }

    void run();

    return () => {
      cancelled = true;
      if (interval) window.clearInterval(interval);
      unsubRoom?.();
      unsubPlayers?.();
      unsubGame?.();
      unsubGamePlayers?.();
      if (user) {
        void updateDoc(doc(firestore, "rooms", roomId, "players", user.uid), {
          leftAt: serverTimestamp(),
        }).catch(() => {});
      }
    };
  }, [roomId, upsertPresence, user, configuredDb, pushToast, router]);

  const hostUid = roomMeta?.hostUid ?? null;
  const isHost = !!(user && roomMeta && user.uid === roomMeta.hostUid);
  const lobby = game?.status !== "playing";
  const cap = roomMeta?.maxPlayers ?? MAX_ROOM_PLAYERS;
  const startingCash = roomMeta?.startingCash ?? DEFAULT_STARTING_CASH;

  const currentTurnUid = useMemo(() => {
    if (!game || game.status !== "playing") return null;
    if (players.length === 0) return null;
    return players[game.turnIndex % players.length]?.uid ?? null;
  }, [game, players]);

  const tokensByCell = useMemo(() => {
    const map: Record<number, string[]> = {};
    if (game?.status === "playing") {
      for (const p of players) {
        const gp = gamePlayers[p.uid];
        const color = p.tokenColor;
        if (!color || !gp) continue;
        const pos = gp.position ?? 0;
        if (!map[pos]) map[pos] = [];
        map[pos].push(color);
      }
    } else {
      for (const p of players) {
        if (!p.tokenColor) continue;
        if (!map[0]) map[0] = [];
        map[0].push(p.tokenColor);
      }
    }
    return map;
  }, [players, gamePlayers, game?.status]);

  const hostDisplayName = useMemo(() => {
    if (!hostUid) return t("room.hostFallback");
    return (
      players.find((p) => p.uid === hostUid)?.displayName ?? t("room.hostFallback")
    );
  }, [players, hostUid, t]);

  const currentTurnName = useMemo(() => {
    if (!currentTurnUid) return "—";
    if (user && currentTurnUid === user.uid) return t("room.you");
    return (
      players.find((p) => p.uid === currentTurnUid)?.displayName ?? currentTurnUid
    );
  }, [currentTurnUid, user, players, t]);

  const resolvePlayerName = useCallback(
    (uid: string) =>
      players.find((p) => p.uid === uid)?.displayName ?? uid.slice(0, 8),
    [players]
  );

  const me = user?.uid ? gamePlayers[user.uid] : null;

  async function pickToken(hex: string) {
    if (!user || !configuredDb || !lobby) return;
    try {
      await setDoc(
        doc(configuredDb, "rooms", roomId, "players", user.uid),
        { tokenColor: hex },
        { merge: true }
      );
    } catch (e: unknown) {
      pushToast(e instanceof Error ? e.message : "Failed to save");
    }
  }

  async function startGame() {
    if (!user || !roomMeta) return;
    if (user.uid !== hostUid) return;
    const dbx = configuredDb;
    if (!dbx) return;
    setActionBusy(true);
    try {
      if (players.length < MIN_PLAYERS_TO_START) {
        pushToast(t("errors.needTwoPlayers"));
        return;
      }
      if (!players.every((p) => p.tokenColor)) {
        pushToast(t("errors.needTokens"));
        return;
      }
      if (players.length > roomMeta.maxPlayers) {
        pushToast(t("room.errTooManyPlayers"));
        return;
      }
      const cash = roomMeta.startingCash;
      await runTransaction(dbx, async (tx) => {
        const stateRef = doc(dbx, "rooms", roomId, "game", "state");
        const stateSnap = await tx.get(stateRef);
        const current = stateSnap.exists() ? (stateSnap.data() as GameState) : null;
        if (current?.status === "playing") return;

        tx.set(
          stateRef,
          {
            status: "playing",
            startedAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            turnIndex: 0,
            startingCash: cash,
            tileOwners: {},
            tileUpgrades: {},
            gameLog: [],
            pendingPurchase: null,
            lastRent: null,
          } satisfies Partial<GameState>,
          { merge: true }
        );

        for (const p of players) {
          const pRef = doc(dbx, "rooms", roomId, "game", "state", "players", p.uid);
          tx.set(
            pRef,
            {
              uid: p.uid,
              position: 0,
              money: cash,
              updatedAt: serverTimestamp(),
            } satisfies GamePlayerState,
            { merge: true }
          );
        }
      });
    } catch (e: unknown) {
      pushToast(e instanceof Error ? e.message : "Failed to start game");
    } finally {
      setActionBusy(false);
    }
  }

  async function rollDice() {
    if (!user) return;
    const dbx = configuredDb;
    if (!dbx) return;
    if (game?.pendingPurchase?.uid === user.uid) {
      pushToast(t("errors.finishPurchaseFirst"));
      return;
    }
    setDiceRolling(true);
    await new Promise((r) => setTimeout(r, 850));
    setActionBusy(true);
    try {
      await runTransaction(dbx, async (tx) => {
        const stateRef = doc(dbx, "rooms", roomId, "game", "state");
        const stateSnap = await tx.get(stateRef);
        if (!stateSnap.exists()) throw new Error("Game has not started.");
        const state = stateSnap.data() as GameState;
        if (state.status !== "playing") throw new Error("Game is not in progress.");
        if (players.length === 0) throw new Error("No players.");

        const turnUid = players[state.turnIndex % players.length]?.uid;
        if (turnUid !== user.uid) throw new Error("Not your turn.");

        if (state.pendingPurchase?.uid === user.uid) {
          throw new Error("Finish purchase first.");
        }

        const a = 1 + Math.floor(Math.random() * 6);
        const b = 1 + Math.floor(Math.random() * 6);
        const total = a + b;

        const meRef = doc(dbx, "rooms", roomId, "game", "state", "players", user.uid);
        const meSnap = await tx.get(meRef);
        const baseCash = state.startingCash ?? startingCash ?? DEFAULT_STARTING_CASH;
        const meState = meSnap.exists()
          ? (meSnap.data() as GamePlayerState)
          : ({ uid: user.uid, position: 0, money: baseCash } satisfies GamePlayerState);

        const oldPos = meState.position;
        const goBonus = crossedGoBonus(oldPos, total);
        let money = meState.money + goBonus;
        const nextPos = (oldPos + total) % BOARD_SIZE;
        const tile = BOARD_TILES[nextPos];

        const outcome = resolveLanding({
          tileIndex: nextPos,
          tile,
          meUid: user.uid,
          myMoney: money,
          tileOwners: state.tileOwners ?? {},
          tileUpgrades: state.tileUpgrades ?? {},
          diceA: a,
          diceB: b,
        });

        const finalPos = outcome.positionOverride ?? nextPos;
        money += outcome.moneyDelta;
        money = Math.max(0, money);

        if (outcome.payToUid && outcome.rentAmount) {
          const ownerRef = doc(
            dbx,
            "rooms",
            roomId,
            "game",
            "state",
            "players",
            outcome.payToUid
          );
          const ownerSnap = await tx.get(ownerRef);
          if (!ownerSnap.exists()) {
            throw new Error("Owner state missing.");
          }
          const ownerState = ownerSnap.data() as GamePlayerState;
          tx.set(
            ownerRef,
            {
              ...ownerState,
              money: (ownerState.money ?? 0) + outcome.rentAmount,
              updatedAt: serverTimestamp(),
            } satisfies GamePlayerState,
            { merge: true }
          );
        }

        tx.set(
          meRef,
          {
            ...meState,
            position: finalPos,
            money,
            updatedAt: serverTimestamp(),
          } satisfies GamePlayerState,
          { merge: true }
        );

        const newTurnIndex = outcome.advanceTurn
          ? (state.turnIndex ?? 0) + 1
          : (state.turnIndex ?? 0);

        const pending = outcome.pendingPurchase
          ? {
              uid: user.uid,
              tileIndex: outcome.pendingPurchase.tileIndex,
              price: outcome.pendingPurchase.price,
            }
          : null;

        const gameLog = [...(state.gameLog ?? [])];
        if (goBonus > 0) gameLog.push(`passGo:${goBonus}`);
        gameLog.push(`roll:${a}:${b}:${total}`);
        gameLog.push(...outcome.logLines);
        const trimmed = gameLog.slice(-50);

        const lastRentData =
          outcome.payToUid && outcome.rentAmount
            ? {
                payerUid: user.uid,
                ownerUid: outcome.payToUid,
                amount: outcome.rentAmount,
                tileIndex: nextPos,
              }
            : null;

        tx.set(
          stateRef,
          {
            ...state,
            updatedAt: serverTimestamp(),
            turnIndex: newTurnIndex,
            lastRoll: { uid: user.uid, a, b, total, at: serverTimestamp() },
            lastRent: lastRentData,
            pendingPurchase: pending,
            gameLog: trimmed,
            tileOwners: state.tileOwners ?? {},
            tileUpgrades: state.tileUpgrades ?? {},
          } satisfies Partial<GameState>,
          { merge: true }
        );
      });
    } catch (e: unknown) {
      pushToast(e instanceof Error ? e.message : t("room.errRoll"));
    } finally {
      setActionBusy(false);
      setDiceRolling(false);
    }
  }

  async function buyProperty() {
    if (!user) return;
    const dbx = configuredDb;
    if (!dbx) return;
    setActionBusy(true);
    try {
      await runTransaction(dbx, async (tx) => {
        const stateRef = doc(dbx, "rooms", roomId, "game", "state");
        const stateSnap = await tx.get(stateRef);
        if (!stateSnap.exists()) throw new Error("Game has not started.");
        const state = stateSnap.data() as GameState;
        const p = state.pendingPurchase;
        if (!p || p.uid !== user.uid) throw new Error("Not pending purchase.");

        const tileKey = String(p.tileIndex);
        const already = (state.tileOwners ?? {})[tileKey];
        if (already && already !== user.uid) {
          const gameLog = [...(state.gameLog ?? []), `blockedBuy:${p.tileIndex}`].slice(
            -50
          );
          tx.set(
            stateRef,
            {
              ...state,
              pendingPurchase: null,
              turnIndex: (state.turnIndex ?? 0) + 1,
              gameLog,
              updatedAt: serverTimestamp(),
            } satisfies Partial<GameState>,
            { merge: true }
          );
          return;
        }
        if (already === user.uid) {
          tx.set(
            stateRef,
            {
              ...state,
              pendingPurchase: null,
              turnIndex: (state.turnIndex ?? 0) + 1,
              updatedAt: serverTimestamp(),
            } satisfies Partial<GameState>,
            { merge: true }
          );
          return;
        }

        const meRef = doc(dbx, "rooms", roomId, "game", "state", "players", user.uid);
        const meSnap = await tx.get(meRef);
        if (!meSnap.exists()) throw new Error("No player state.");
        const meState = meSnap.data() as GamePlayerState;
        if ((meState.money ?? 0) < p.price) throw new Error("Can't afford.");

        const tileOwners = { ...(state.tileOwners ?? {}), [tileKey]: user.uid };
        const tileUpgrades = { ...(state.tileUpgrades ?? {}) };
        const gameLog = [...(state.gameLog ?? []), `bought:${p.tileIndex}`].slice(-50);

        tx.set(
          meRef,
          {
            ...meState,
            money: (meState.money ?? 0) - p.price,
            updatedAt: serverTimestamp(),
          } satisfies GamePlayerState,
          { merge: true }
        );

        tx.set(
          stateRef,
          {
            ...state,
            pendingPurchase: null,
            turnIndex: (state.turnIndex ?? 0) + 1,
            tileOwners,
            tileUpgrades,
            gameLog,
            updatedAt: serverTimestamp(),
          } satisfies Partial<GameState>,
          { merge: true }
        );
      });
    } catch (e: unknown) {
      pushToast(e instanceof Error ? e.message : t("room.errRoll"));
    } finally {
      setActionBusy(false);
    }
  }

  async function declinePurchase() {
    if (!user) return;
    const dbx = configuredDb;
    if (!dbx) return;
    setActionBusy(true);
    try {
      await runTransaction(dbx, async (tx) => {
        const stateRef = doc(dbx, "rooms", roomId, "game", "state");
        const stateSnap = await tx.get(stateRef);
        if (!stateSnap.exists()) throw new Error("Game has not started.");
        const state = stateSnap.data() as GameState;
        const p = state.pendingPurchase;
        if (!p || p.uid !== user.uid) throw new Error("Not pending purchase.");

        const gameLog = [...(state.gameLog ?? []), `declined:${p.tileIndex}`].slice(-50);

        tx.set(
          stateRef,
          {
            ...state,
            pendingPurchase: null,
            turnIndex: (state.turnIndex ?? 0) + 1,
            gameLog,
            updatedAt: serverTimestamp(),
          } satisfies Partial<GameState>,
          { merge: true }
        );
      });
    } catch (e: unknown) {
      pushToast(e instanceof Error ? e.message : t("room.errRoll"));
    } finally {
      setActionBusy(false);
    }
  }

  async function upgradeProperty(tileIndex: number) {
    if (!user) return;
    const dbx = configuredDb;
    if (!dbx) return;
    setActionBusy(true);
    try {
      await runTransaction(dbx, async (tx) => {
        const stateRef = doc(dbx, "rooms", roomId, "game", "state");
        const stateSnap = await tx.get(stateRef);
        if (!stateSnap.exists()) throw new Error("Game has not started.");
        const state = stateSnap.data() as GameState;
        if (state.status !== "playing") throw new Error("Game is not in progress.");

        const turnUid = players[state.turnIndex % players.length]?.uid;
        if (turnUid !== user.uid) throw new Error("Not your turn.");
        if (state.pendingPurchase?.uid === user.uid) throw new Error("Finish purchase first.");

        const tileKey = String(tileIndex);
        const owner = (state.tileOwners ?? {})[tileKey];
        if (owner !== user.uid) throw new Error("Not owner.");

        const meta = BOARD_TILES[tileIndex];
        const group = meta?.subtitle;
        if (!group) throw new Error("Not upgradable.");

        const ownedInGroup = Object.entries(state.tileOwners ?? {}).filter(([k, v]) => {
          if (v !== user.uid) return false;
          const idx = Number.parseInt(k, 10);
          return BOARD_TILES[idx]?.subtitle === group;
        }).length;
        if (ownedInGroup < 2) throw new Error("Need group.");

        const tileUpgrades = { ...(state.tileUpgrades ?? {}) };
        tileUpgrades[tileKey] = 1;
        const gameLog = [...(state.gameLog ?? []), `upgrade2x:${tileIndex}`].slice(-50);

        tx.set(
          stateRef,
          {
            ...state,
            tileUpgrades,
            gameLog,
            updatedAt: serverTimestamp(),
          } satisfies Partial<GameState>,
          { merge: true }
        );
      });
    } catch (e: unknown) {
      pushToast(e instanceof Error ? e.message : t("room.errRoll"));
    } finally {
      setActionBusy(false);
    }
  }

  const myPlayer = players.find((p) => p.uid === user?.uid);
  const showTokenModal = !!(lobby && user && !myPlayer?.tokenColor);
  const fmtMoney = (n: number) =>
    `$${n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")}`;

  const lastRentLine = useMemo(() => {
    const lr = game?.lastRent;
    if (!lr) return null;
    const place = BOARD_TILES[lr.tileIndex]?.title ?? `#${lr.tileIndex}`;
    const amt = fmtMoney(lr.amount);
    const ownerName = resolvePlayerName(lr.ownerUid);
    const payerName = resolvePlayerName(lr.payerUid);
    if (user?.uid === lr.payerUid) {
      return t("room.lastRentYouPaid", { amount: amt, place, owner: ownerName });
    }
    if (user?.uid === lr.ownerUid) {
      return t("room.lastRentYouGot", { amount: amt, place, payer: payerName });
    }
    return t("room.lastRentOther", {
      payer: payerName,
      amount: amt,
      place,
      owner: ownerName,
    });
  }, [game?.lastRent, user?.uid, t, resolvePlayerName]);

  const pendingBuy =
    user && game?.pendingPurchase?.uid === user.uid
      ? game.pendingPurchase
      : null;

  const myOwnedProps = useMemo(() => {
    if (!user || game?.status !== "playing") return [];
    const owners = game.tileOwners ?? {};
    const upgrades = game.tileUpgrades ?? {};
    const out = Object.entries(owners)
      .filter(([, uid]) => uid === user.uid)
      .map(([k]) => Number.parseInt(k, 10))
      .filter((n) => Number.isFinite(n) && BOARD_TILES[n]?.price != null)
      .sort((a, b) => a - b)
      .map((idx) => {
        const meta = BOARD_TILES[idx];
        const group = meta.subtitle;
        const ownedInGroup = group
          ? Object.entries(owners).filter(([kk, uid]) => {
              if (uid !== user.uid) return false;
              const ii = Number.parseInt(kk, 10);
              return BOARD_TILES[ii]?.subtitle === group;
            }).length
          : 0;
        return {
          idx,
          title: meta.title,
          group,
          canUpgrade: ownedInGroup >= 2 && (upgrades[String(idx)] ?? 0) < 1,
          upgraded: (upgrades[String(idx)] ?? 0) >= 1,
        };
      });
    return out;
  }, [user, game?.status, game?.tileOwners, game?.tileUpgrades]);

  return (
    <div className="relative flex flex-1 flex-col">
      <TokenJoinModal
        hint={t("room.pickTokenHint")}
        onPick={(hex) => void pickToken(hex)}
        open={showTokenModal}
        title={t("room.pickTokenTitle")}
      />
      {pendingBuy ? (
        <PurchaseModal
          busy={actionBusy}
          buyLabel={t("room.buyFor", {
            price: fmtMoney(pendingBuy.price),
          })}
          declineLabel={t("room.declineBuy")}
          hint={t("room.purchaseHint")}
          onBuy={() => void buyProperty()}
          onDecline={() => void declinePurchase()}
          open
          priceLabel={fmtMoney(pendingBuy.price)}
          tileIndex={pendingBuy.tileIndex}
          title={t("room.purchaseTitle")}
        />
      ) : null}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(1100px_circle_at_30%_10%,rgba(124,58,237,0.30),transparent_55%),radial-gradient(900px_circle_at_80%_30%,rgba(34,197,94,0.18),transparent_60%)]" />

      <header className="relative mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-6 py-6">
        <div className="flex items-center gap-3">
          <Link className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]" href="/lobby">
            {t("nav.backToLobby")}
          </Link>
          <div className="text-lg font-semibold tracking-tight">{t("room.title")}</div>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <LanguageToggleBox showLabel={false} />
          <Button
            className="h-9 px-3"
            onClick={() => {
              window.location.reload();
            }}
            type="button"
            variant="secondary"
          >
            {t("room.refresh")}
          </Button>
        </div>
      </header>

      <main className="relative mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-6 pb-10 lg:flex-row lg:items-start">
        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <div className="rounded-2xl bg-white/[0.03] p-2 ring-1 ring-white/10 sm:p-3">
            <BoardGrid
              centerSlot={
                <BoardCenter
                  diceRolling={diceRolling}
                  game={game}
                  hostDisplayName={hostDisplayName}
                  lobby={lobby}
                  resolvePlayerName={resolvePlayerName}
                  roomId={roomId}
                />
              }
              tokensByCell={tokensByCell}
            />
          </div>
        </div>

        <aside className="flex w-full shrink-0 flex-col gap-4 lg:sticky lg:top-4 lg:w-[320px] xl:w-[360px]">
          <Card className="p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-lg font-semibold tracking-tight">{t("room.privateTitle")}</h1>
                <p className="mt-0.5 text-xs text-[var(--muted)]">
                  {t("room.roomId")}: {roomId}
                </p>
              </div>
              <Button
                className="h-9 shrink-0 px-3 text-sm"
                onClick={async () => {
                  try {
                    await copyToClipboard(inviteUrl);
                    setCopied(true);
                    window.setTimeout(() => setCopied(false), 1500);
                  } catch (e: unknown) {
                    pushToast(e instanceof Error ? e.message : t("room.errCopy"));
                  }
                }}
                type="button"
                variant="secondary"
              >
                {copied ? t("room.copied") : t("room.copyInvite")}
              </Button>
            </div>
          </Card>

          {configuredDb && roomMeta ? (
            <RoomSettingsPanel
              currentPlayerCount={players.length}
              db={configuredDb}
              isHost={isHost}
              labels={{
                title: t("room.settings.title"),
                maxPlayers: t("room.settings.maxPlayers"),
                maxPlayersHint: t("room.settings.maxPlayersHint"),
                startingCash: t("room.settings.startingCash"),
                startingCashHint: t("room.settings.startingCashHint"),
                hostOnly: t("room.settings.hostOnly"),
                lockedAfterStart: t("room.settings.lockedAfterStart"),
                capBelowPlayers: t("room.settings.capBelowPlayers"),
              }}
              lobby={lobby}
              maxPlayers={roomMeta.maxPlayers}
              roomId={roomId}
              startingCash={roomMeta.startingCash}
            />
          ) : null}

          <Card>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold tracking-tight">{t("room.game")}</h2>
              <div className="text-sm text-[var(--muted)]">
                {game?.status === "playing" ? t("room.statusPlaying") : t("room.statusLobby")}
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-[var(--muted)]">
                {game?.status === "playing" ? (
                  <>
                    {t("room.turn")}:{" "}
                    <span className="font-medium text-[var(--foreground)]">{currentTurnName}</span>
                    {me ? (
                      <>
                        {" "}
                        · {fmtMoney(me.money ?? 0)}
                      </>
                    ) : null}
                    {lastRentLine ? (
                      <span className="mt-2 block text-xs leading-snug text-amber-200/90">
                        {lastRentLine}
                      </span>
                    ) : null}
                  </>
                ) : (
                  t("room.waitHost")
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {isHost && lobby ? (
                  <Button
                    className="h-10"
                    disabled={
                      actionBusy ||
                      players.length < MIN_PLAYERS_TO_START ||
                      players.length > cap
                    }
                    onClick={() => void startGame()}
                    type="button"
                  >
                    {actionBusy ? t("room.starting") : t("room.startGame")}
                  </Button>
                ) : null}

                {game?.status === "playing" ? (
                  <Button
                    className="h-10 whitespace-nowrap px-4"
                    disabled={
                      actionBusy ||
                      currentTurnUid !== user?.uid ||
                      game?.pendingPurchase?.uid === user?.uid
                    }
                    onClick={() => void rollDice()}
                    type="button"
                    variant="secondary"
                  >
                    {actionBusy || diceRolling ? t("room.rolling") : t("room.rollDice")}
                  </Button>
                ) : null}
              </div>
            </div>
          </Card>

          {game?.status === "playing" && user ? (
            <Card>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold tracking-tight">{t("room.myProperties")}</h2>
                <div className="text-sm text-[var(--muted)]">
                  {t("room.propertiesCount", { count: myOwnedProps.length })}
                </div>
              </div>

              <div className="mt-4 grid gap-2">
                {myOwnedProps.length === 0 ? (
                  <div className="text-sm text-[var(--muted)]">{t("room.noProperties")}</div>
                ) : null}
                {myOwnedProps.map((p) => (
                  <div
                    key={p.idx}
                    className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3 ring-1 ring-white/10"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-white/90">
                        {p.title}
                      </div>
                      <div className="mt-0.5 text-xs text-white/45">
                        {p.group ? t("room.groupFlag", { flag: p.group }) : "—"}
                        {p.upgraded ? (
                          <span className="ml-2 rounded-md bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-200">
                            2x
                          </span>
                        ) : null}
                      </div>
                    </div>
                    <Button
                      className="h-9 px-3"
                      disabled={
                        actionBusy ||
                        !p.canUpgrade ||
                        currentTurnUid !== user.uid ||
                        game?.pendingPurchase?.uid === user.uid
                      }
                      onClick={() => void upgradeProperty(p.idx)}
                      type="button"
                      variant="secondary"
                    >
                      {p.upgraded ? t("room.upgraded") : t("room.upgrade2x")}
                    </Button>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-[11px] text-white/40">
                {t("room.upgradeHint")}
              </p>
            </Card>
          ) : null}

          <Card>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold tracking-tight">{t("room.players")}</h2>
              <div className="text-sm text-[var(--muted)]">
                {status === "idle"
                  ? t("room.connecting")
                  : t("room.playersCap", { current: players.length, max: cap })}
              </div>
            </div>

            <div className="mt-4 grid gap-2">
              {players.map((p) => (
                <div
                  key={p.uid}
                  className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3 ring-1 ring-white/10"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <span
                      className="h-3 w-3 shrink-0 rounded-full ring-1 ring-white/20"
                      style={{ backgroundColor: p.tokenColor ?? "#6b7280" }}
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 truncate text-sm font-medium text-white/90">
                        {p.displayName ?? p.email ?? p.uid}
                        {p.uid === hostUid ? (
                          <span className="shrink-0 text-amber-300/90" title={t("room.hostBadge")}>
                            ★
                          </span>
                        ) : null}
                      </div>
                      <div className="truncate text-xs text-white/45">{p.uid}</div>
                    </div>
                  </div>
                  <div className="h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-500" />
                </div>
              ))}

              {players.length === 0 ? (
                <div className="text-sm text-[var(--muted)]">{t("room.noPlayers")}</div>
              ) : null}
            </div>
          </Card>
        </aside>
      </main>
    </div>
  );
}
