"use client";

import { useState } from "react";
import { nanoid } from "nanoid";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { getDb, isFirebaseConfigured } from "@/lib/firebase";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useI18n } from "@/i18n/I18nProvider";
import { useToast } from "@/components/ToastProvider";
import { LanguageToggleBox } from "@/components/LanguageToggleBox";
import {
  clampMaxPlayers,
  DEFAULT_MAX_PLAYERS,
  DEFAULT_STARTING_CASH,
  MIN_ROOM_PLAYERS,
  STARTING_CASH_OPTIONS,
} from "@/lib/roomSettings";
import { MAX_ROOM_PLAYERS } from "@/lib/constants";

export default function NewRoomPage() {
  const router = useRouter();
  const { t } = useI18n();
  const { pushToast } = useToast();
  const { user } = useAuth();
  const [maxPlayers, setMaxPlayers] = useState(DEFAULT_MAX_PLAYERS);
  const [startingCash, setStartingCash] = useState(DEFAULT_STARTING_CASH);
  const [busy, setBusy] = useState(false);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    if (!isFirebaseConfigured()) {
      pushToast("Firebase is not configured (.env.local missing).");
      return;
    }
    const db = getDb();
    if (!db) {
      pushToast("Firestore is not available.");
      return;
    }
    setBusy(true);
    try {
      const roomId = nanoid(10);
      await setDoc(doc(db, "rooms", roomId), {
        id: roomId,
        createdAt: serverTimestamp(),
        hostUid: user.uid,
        status: "lobby",
        maxPlayers: clampMaxPlayers(maxPlayers),
        startingCash,
      });
      router.replace(`/room/${roomId}`);
    } catch (err: unknown) {
      pushToast(err instanceof Error ? err.message : "Failed to create room");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative flex min-h-dvh flex-1 flex-col">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(1100px_circle_at_30%_10%,rgba(124,58,237,0.30),transparent_55%),radial-gradient(900px_circle_at_80%_30%,rgba(34,197,94,0.18),transparent_60%)]" />

      <header className="relative mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-6 py-6">
        <Link
          className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
          href="/lobby"
        >
          {t("nav.backToLobby")}
        </Link>
        <div className="text-lg font-semibold tracking-tight text-[var(--foreground)]">
          {t("roomNew.title")}
        </div>
        <LanguageToggleBox showLabel={false} />
      </header>

      <main className="relative mx-auto flex w-full max-w-lg flex-1 flex-col px-6 pb-12">
        <Card className="w-full p-6">
          <h1 className="text-xl font-semibold tracking-tight">{t("roomNew.setupHeading")}</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">{t("roomNew.setupSubtitle")}</p>

          <form className="mt-6 flex flex-col gap-5" onSubmit={(e) => void onCreate(e)}>
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium text-white/80">{t("room.settings.maxPlayers")}</span>
              <span className="text-xs text-white/45">{t("room.settings.maxPlayersHint")}</span>
              <select
                className="h-11 rounded-xl bg-white/5 px-3 text-sm text-[var(--foreground)] ring-1 ring-white/12 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/70"
                value={maxPlayers}
                onChange={(e) => setMaxPlayers(Number(e.target.value))}
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
              <span className="text-sm font-medium text-white/80">{t("room.settings.startingCash")}</span>
              <span className="text-xs text-white/45">{t("room.settings.startingCashHint")}</span>
              <select
                className="h-11 rounded-xl bg-white/5 px-3 text-sm text-[var(--foreground)] ring-1 ring-white/12 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/70"
                value={startingCash}
                onChange={(e) => setStartingCash(Number(e.target.value))}
              >
                {STARTING_CASH_OPTIONS.map((n) => (
                  <option key={n} value={n}>
                    ${n.toLocaleString()}
                  </option>
                ))}
              </select>
            </label>

            <Button className="w-full" disabled={busy || !user} type="submit">
              {busy ? t("roomNew.creating") : t("roomNew.createRoom")}
            </Button>
          </form>

          <div className="mt-4">
            <Link className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]" href="/lobby">
              {t("roomNew.backLobby")}
            </Link>
          </div>
        </Card>
      </main>
    </div>
  );
}
