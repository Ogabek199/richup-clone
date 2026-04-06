import type { Locale } from "@/i18n/messages";
import { translate } from "@/i18n/messages";

const MAP: Record<string, string> = {
  "Game has not started.": "errors.gameNotStarted",
  "Game is not in progress.": "errors.notInProgress",
  "No players.": "errors.noPlayers",
  "Not your turn.": "errors.notYourTurn",
  "Failed to start game": "room.errStart",
  "Roll failed": "room.errRoll",
  "Failed to create room": "roomNew.errCreate",
  "Firestore is not available.": "room.errFirestore",
  "Firebase is not configured (.env.local missing) or Firestore unavailable.": "room.errConfig",
  "Room not found.": "room.errRoomNotFound",
  "Failed to join room": "room.errJoin",
  "Copy failed": "room.errCopy",
  "Firebase is not configured (.env.local missing).": "auth.errFirebaseEnv",
  "Firebase auth is not available.": "auth.errAuthUnavailable",
  "Room is full.": "room.errRoomFull",
  "Too many players to start.": "room.errTooManyPlayers",
  "Firebase or Firestore is not configured.": "rooms.errFirebase",
  "Google sign-in failed": "auth.errGoogle",
  "Sign-in failed": "auth.errSignIn",
  "Sign-up failed": "auth.errSignUp",
  "Need at least 2 players.": "errors.needTwoPlayers",
  "Finish purchase first.": "errors.finishPurchaseFirst",
  "Not pending purchase.": "errors.notPendingPurchase",
  "Can't afford.": "errors.cantAffordBuy",
  "Owner state missing.": "errors.ownerStateMissing",
};

/** Maps known app + Firebase Auth messages to the active locale. */
export function mapErrorMessage(message: string, locale: Locale): string {
  const direct = MAP[message];
  if (direct) return translate(locale, direct);

  const m = message;
  const lower = m.toLowerCase();

  if (
    lower.includes("auth/invalid-credential") ||
    lower.includes("auth/wrong-password") ||
    lower.includes("auth/invalid-email")
  ) {
    return translate(locale, "auth.errInvalidCredentials");
  }
  if (lower.includes("auth/user-not-found")) {
    return translate(locale, "auth.errUserNotFound");
  }
  if (lower.includes("auth/email-already-in-use")) {
    return translate(locale, "auth.errEmailInUse");
  }
  if (lower.includes("auth/weak-password")) {
    return translate(locale, "auth.errWeakPassword");
  }
  if (lower.includes("auth/network-request-failed") || lower.includes("auth/network")) {
    return translate(locale, "auth.errNetwork");
  }
  if (lower.includes("auth/too-many-requests")) {
    return translate(locale, "auth.errTooManyRequests");
  }
  if (lower.includes("auth/popup-closed-by-user")) {
    return translate(locale, "auth.errPopupClosed");
  }
  if (
    lower.includes("invalid collection reference") ||
    lower.includes("invalid document reference") ||
    lower.includes("odd number of segments") ||
    lower.includes("even number of segments")
  ) {
    return translate(locale, "errors.firestorePathInvalid");
  }

  return message;
}

/** @deprecated Use mapErrorMessage — kept for any older imports */
export function mapKnownError(message: string, locale: Locale): string {
  return mapErrorMessage(message, locale);
}
