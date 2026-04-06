"use client";

import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getFirebaseAuth, isFirebaseConfigured } from "@/lib/firebase";

export async function signInWithGoogle() {
  if (!isFirebaseConfigured()) {
    throw new Error("Firebase is not configured (.env.local missing).");
  }
  const auth = getFirebaseAuth();
  if (!auth) throw new Error("Firebase auth is not available.");

  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  return await signInWithPopup(auth, provider);
}

