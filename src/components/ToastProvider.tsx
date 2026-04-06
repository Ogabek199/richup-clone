"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useI18n } from "@/i18n/I18nProvider";
import { mapErrorMessage } from "@/i18n/mapKnownError";
import type { Locale } from "@/i18n/messages";

type ToastCtx = { pushToast: (message: string) => void };

const ToastContext = createContext<ToastCtx | null>(null);

export function useToast() {
  const c = useContext(ToastContext);
  if (!c) throw new Error("useToast must be used within ToastProvider");
  return c;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<{ id: string; message: string }[]>([]);
  const { locale } = useI18n();

  const pushToast = useCallback((message: string) => {
    const id = crypto.randomUUID();
    setItems((prev) => [...prev, { id, message }]);
    window.setTimeout(() => {
      setItems((prev) => prev.filter((t) => t.id !== id));
    }, 5200);
  }, []);

  const value = useMemo(() => ({ pushToast }), [pushToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed top-4 right-4 z-[100] flex w-[min(22rem,calc(100vw-2rem))] min-w-0 flex-col gap-2"
        aria-live="polite"
      >
        {items.map((item) => (
          <ToastItem key={item.id} locale={locale} message={item.message} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ message, locale }: { message: string; locale: Locale }) {
  return (
    <div
      className="pointer-events-auto w-full min-w-0 max-w-full rounded-xl border border-red-500/30 bg-[color-mix(in_oklab,var(--background)_92%,transparent)] px-4 py-3 text-sm leading-snug text-red-100 shadow-lg ring-1 ring-white/10 backdrop-blur-md [overflow-wrap:anywhere] [word-break:break-word]"
    >
      {mapErrorMessage(message, locale)}
    </div>
  );
}
