"use client";

import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useI18n } from "@/i18n/I18nProvider";
import { cn } from "@/components/ui/cn";

export function LanguageToggleBox({
  className,
  showLabel = true,
}: {
  className?: string;
  showLabel?: boolean;
}) {
  const { t } = useI18n();

  return (
    <div
      className={cn(
        "flex shrink-0 items-center gap-2 rounded-2xl px-2.5 py-1.5 backdrop-blur-md",
        className
      )}
    >
      {showLabel ? (
        <span className="hidden text-xs text-white/45 sm:inline">{t("lang.label")}</span>
      ) : null}
      <LanguageSwitcher />
    </div>
  );
}
