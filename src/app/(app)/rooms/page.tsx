"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  type Unsubscribe,
} from "firebase/firestore";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { getDb, isFirebaseConfigured } from "@/lib/firebase";
import type { Room } from "@/lib/room";
import { useI18n } from "@/i18n/I18nProvider";
import { useToast } from "@/components/ToastProvider";
import { LanguageToggleBox } from "@/components/LanguageToggleBox";

function formatCreatedAt(value: unknown): string {
  if (!value || typeof value !== "object") return "—";
  const ts = value as { toDate?: () => Date };
  if (typeof ts.toDate === "function") {
    try {
      return ts.toDate().toLocaleString();
    } catch {
      return "—";
    }
  }
  return "—";
}

export default function RoomsPage() {
  const { t } = useI18n();
  const { pushToast } = useToast();
  const db = useMemo(() => getDb(), []);
  const firebaseOk = isFirebaseConfigured() && !!db;
  const configNotified = useRef(false);

  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(() => firebaseOk);

  useEffect(() => {
    if (!firebaseOk) {
      if (!configNotified.current) {
        configNotified.current = true;
        pushToast("Firebase or Firestore is not configured.");
      }
      return;
    }

    const q = query(collection(db, "rooms"), orderBy("createdAt", "desc"), limit(100));

    let unsub: Unsubscribe | null = null;
    unsub = onSnapshot(
      q,
      (snap) => {
        const next: Room[] = [];
        snap.forEach((docSnap) => {
          const data = docSnap.data();
          next.push({
            id: typeof data.id === "string" ? data.id : docSnap.id,
            hostUid: typeof data.hostUid === "string" ? data.hostUid : "",
            status:
              data.status === "playing" || data.status === "ended" || data.status === "lobby"
                ? data.status
                : "lobby",
            createdAt: data.createdAt,
          });
        });
        setRooms(next);
        setLoading(false);
      },
      (e) => {
        pushToast(e.message);
        setLoading(false);
      }
    );

    return () => {
      unsub?.();
    };
  }, [firebaseOk, db, pushToast]);

  return (
    <div className="relative flex flex-1 flex-col">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(1100px_circle_at_30%_10%,rgba(124,58,237,0.30),transparent_55%),radial-gradient(900px_circle_at_80%_30%,rgba(34,197,94,0.18),transparent_60%)]" />

      <header className="relative mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-3 px-6 py-6">
        <div className="flex items-center gap-3">
          <Link className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]" href="/lobby">
            {t("nav.backToLobby")}
          </Link>
          <div className="text-lg font-semibold tracking-tight text-[var(--foreground)]">
            {t("rooms.title")}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <LanguageToggleBox showLabel={false} />
          <Link href="/room/new">
            <Button className="h-9 px-3">{t("rooms.create")}</Button>
          </Link>
        </div>
      </header>

      <main className="relative mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-6 pb-10">
        <Card>
          <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">
                {t("rooms.title")}
              </h1>
              <p className="mt-1 text-sm text-[var(--muted)]">{t("rooms.subtitle")}</p>
            </div>
          </div>
          <p className="mt-3 text-xs text-white/40">{t("rooms.hint")}</p>

          {loading ? (
            <div className="mt-6 text-sm text-[var(--muted)]">{t("rooms.loading")}</div>
          ) : rooms.length === 0 && firebaseOk ? (
            <div className="mt-6 text-sm text-[var(--muted)]">{t("rooms.empty")}</div>
          ) : rooms.length === 0 ? null : (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-[var(--muted)]">
                    <th className="pb-3 pr-4 font-medium">{t("rooms.colRoomId")}</th>
                    <th className="pb-3 pr-4 font-medium">{t("rooms.colStatus")}</th>
                    <th className="pb-3 pr-4 font-medium">{t("rooms.colHost")}</th>
                    <th className="pb-3 pr-4 font-medium">{t("rooms.colCreated")}</th>
                    <th className="pb-3 font-medium"> </th>
                  </tr>
                </thead>
                <tbody>
                  {rooms.map((r) => (
                    <tr key={r.id} className="border-b border-white/5">
                      <td className="py-3 pr-4 font-mono text-xs text-white/90">{r.id}</td>
                      <td className="py-3 pr-4 capitalize text-white/80">
                        {t(`room.status.${r.status}`)}
                      </td>
                      <td className="py-3 pr-4 font-mono text-xs text-white/60">{r.hostUid || "—"}</td>
                      <td className="py-3 pr-4 text-white/60">{formatCreatedAt(r.createdAt)}</td>
                      <td className="py-3">
                        <Link href={`/room/${r.id}`}>
                          <Button className="h-8 px-3 text-xs" type="button" variant="secondary">
                            {t("rooms.join")}
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </main>
    </div>
  );
}
