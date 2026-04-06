"use client";

import { useI18n } from "@/i18n/I18nProvider";
import type { Locale } from "@/i18n/messages";
import { cn } from "@/components/ui/cn";

function LangButton({
  active,
  label,
  value,
  onSelect,
}: {
  active: boolean;
  label: string;
  value: Locale;
  onSelect: (v: Locale) => void;
}) {
  return (
    <button
      className={cn(
        "rounded-lg px-2.5 py-1 text-xs font-medium transition",
        active ? "bg-white/15 text-white" : "text-white/55 hover:bg-white/10 hover:text-white"
      )}
      onClick={() => onSelect(value)}
      type="button"
    >
      {label}
    </button>
  );
}

export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, setLocale, t } = useI18n();

  return (
    <div
      className={cn(
        "inline-flex items-center gap-0.5 rounded-xl bg-white/10 p-0.5 ring-1 ring-white/15",
        className
      )}
      role="group"
      aria-label={t("lang.label")}
    >
      <LangButton active={locale === "uz"} label={t("lang.uz")} onSelect={setLocale} value="uz" />
      <LangButton active={locale === "en"} label={t("lang.en")} onSelect={setLocale} value="en" />
    </div>
  );
}
