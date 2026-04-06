"use client";

import { getAnalytics, isSupported, type Analytics } from "firebase/analytics";
import { getFirebaseApp, isFirebaseConfigured } from "@/lib/firebase";

let _analytics: Analytics | null = null;

export async function getFirebaseAnalytics(): Promise<Analytics | null> {
  if (_analytics) return _analytics;
  if (!isFirebaseConfigured()) return null;

  const app = getFirebaseApp();
  if (!app) return null;

  if (!(await isSupported())) return null;
  _analytics = getAnalytics(app);
  return _analytics;
}

