"use client";

import { signOut } from "firebase/auth";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { getFirebaseAuth } from "@/lib/firebase";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useI18n } from "@/i18n/I18nProvider";
import { LanguageToggleBox } from "@/components/LanguageToggleBox";

export default function LobbyPage() {
  const { t } = useI18n();
  const { user } = useAuth();

  return (
    <div className="relative flex flex-1 flex-col">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(1100px_circle_at_30%_10%,rgba(124,58,237,0.30),transparent_55%),radial-gradient(900px_circle_at_80%_30%,rgba(34,197,94,0.18),transparent_60%)]" />

      <header className="relative mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-x-4 gap-y-3 px-6 py-6">
        <div className="text-lg font-semibold tracking-tight">{t("brand")}</div>
        <div className="flex flex-wrap items-center justify-end gap-3 sm:gap-4">
          <LanguageToggleBox showLabel={false} />
          <div className="min-w-0 text-sm text-[var(--muted)] bg-white/10 rounded-xl border border-white/10 px-3 py-2">
            {user?.displayName ?? user?.email ?? t("lobby.playerFallback")}
          </div>
          <Button
            className="h-9 px-3"
            onClick={() => {
              const auth = getFirebaseAuth();
              if (!auth) return;
              void signOut(auth);
            }}
            type="button"
            variant="secondary"
          >
            {t("nav.signOut")}
          </Button>
        </div>
      </header>

      <main className="relative mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-6 pb-10">
        <Card>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">{t("lobby.title")}</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">{t("lobby.subtitle")}</p>
          <p className="mt-2 text-xs text-white/45">{t("lobby.maxPlayers")}</p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Link href="/room/new">
              <Button className="w-full sm:w-auto">{t("lobby.createPrivate")}</Button>
            </Link>
            <Link href="/rooms">
              <Button className="w-full sm:w-auto" variant="secondary">
                {t("lobby.allRooms")}
              </Button>
            </Link>
          </div>
        </Card>
      </main>
    </div>
  );
}

