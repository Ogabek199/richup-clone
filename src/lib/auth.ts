import type { User } from "firebase/auth";

export type SessionUser = Pick<User, "uid" | "email" | "displayName" | "photoURL">;

