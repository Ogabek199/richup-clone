"use client";

import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useI18n } from "@/i18n/I18nProvider";
import { LanguageToggleBox } from "@/components/LanguageToggleBox";

export function HomeContent() {
  const { t } = useI18n();

  return (
    <div className="relative flex flex-1 flex-col">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(1100px_circle_at_30%_10%,rgba(124,58,237,0.35),transparent_55%),radial-gradient(900px_circle_at_80%_30%,rgba(34,197,94,0.22),transparent_60%)]" />

      <header className="relative mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-3 px-6 py-6">
        <div className="text-lg font-semibold tracking-tight">{t("brand")}</div>
        <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
          <LanguageToggleBox showLabel={false} />
          <Link href="/login">
            <Button className="h-9 px-3" variant="secondary">
              {t("nav.signIn")}
            </Button>
          </Link>
          <Link href="/signup">
            <Button className="h-9 px-3">{t("nav.createAccount")}</Button>
          </Link>
        </div>
      </header>

      <main className="relative mx-auto flex w-full max-w-5xl flex-1 flex-col px-6 pb-12">
        <Card className="mt-10 p-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs text-white/70 ring-1 ring-white/10">
            {t("home.badge")}
            <span className="h-1 w-1 rounded-full bg-[var(--primary-2)]" />
            {t("home.badgeExtra")}
          </div>

          <h1 className="mt-5 text-4xl font-semibold tracking-tight">{t("home.title")}</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted)]">{t("home.subtitle")}</p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link href="/lobby">
              <Button className="w-full sm:w-auto">{t("home.play")}</Button>
            </Link>
            <Link href="/login">
              <Button className="w-full sm:w-auto" variant="secondary">
                {t("home.haveAccount")}
              </Button>
            </Link>
          </div>
        </Card>
      </main>
    </div>
  );
}
