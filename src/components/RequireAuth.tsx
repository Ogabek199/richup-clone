"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { Card } from "@/components/ui/Card";
import { useI18n } from "@/i18n/I18nProvider";

export function RequireAuth({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  const { user, isLoading, isConfigured } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;
    if (!isConfigured) return;
    if (!user) {
      const next = pathname ?? "/lobby";
      router.replace(`/login?next=${encodeURIComponent(next)}`);
    }
  }, [isLoading, isConfigured, user, router, pathname]);

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center px-6 py-10">
        <div className="text-sm text-[var(--muted)]">{t("requireAuth.loading")}</div>
      </div>
    );
  }

  if (!isConfigured) {
    return (
      <div className="relative flex flex-1 items-center justify-center px-6 py-12">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(1100px_circle_at_30%_10%,rgba(124,58,237,0.30),transparent_55%),radial-gradient(900px_circle_at_80%_30%,rgba(34,197,94,0.18),transparent_60%)]" />
        <Card className="relative w-full max-w-lg">
          <h1 className="text-xl font-semibold tracking-tight">{t("requireAuth.firebaseTitle")}</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">{t("requireAuth.firebaseBody")}</p>
          <p className="mt-2 text-sm text-[var(--muted)]">
            {t("requireAuth.firebaseRestart")}{" "}
            <span className="font-medium text-[var(--foreground)]">npm run dev</span>.
          </p>
        </Card>
      </div>
    );
  }

  if (!user) return null;
  return <>{children}</>;
}

