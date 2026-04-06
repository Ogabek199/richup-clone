"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { getFirebaseAuth, isFirebaseConfigured } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { signInWithGoogle } from "@/lib/googleAuth";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { GoogleIcon } from "@/components/ui/GoogleIcon";
import { useI18n } from "@/i18n/I18nProvider";
import { useToast } from "@/components/ToastProvider";

const schema = z.object({
  displayName: z.string().min(2).max(24),
  email: z.string().email(),
  password: z.string().min(6),
});

type FormValues = z.infer<typeof schema>;

export default function SignupClient({ nextUrl }: { nextUrl?: string }) {
  const router = useRouter();
  const { t } = useI18n();
  const { pushToast } = useToast();
  const next = useMemo(() => nextUrl ?? "/lobby", [nextUrl]);
  const configured = isFirebaseConfigured();
  const [googleBusy, setGoogleBusy] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_circle_at_30%_10%,rgba(124,58,237,0.35),transparent_50%),radial-gradient(800px_circle_at_80%_30%,rgba(34,197,94,0.25),transparent_55%)]" />
      <div className="relative flex flex-1 items-center justify-center px-6 py-12">
      <Card className="relative w-full max-w-md">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">{t("auth.signUpTitle")}</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">{t("auth.signUpSubtitle")}</p>
        </div>

        <Button
          className="w-full"
          disabled={!configured || googleBusy}
          onClick={async () => {
            setGoogleBusy(true);
            try {
              await signInWithGoogle();
              router.replace(next);
            } catch (e: unknown) {
              pushToast(e instanceof Error ? e.message : "Google sign-in failed");
            } finally {
              setGoogleBusy(false);
            }
          }}
          type="button"
          variant="secondary"
        >
          <GoogleIcon />
          {t("auth.continueGoogle")}
        </Button>

        <div className="my-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-white/10" />
          <div className="text-xs text-white/35">{t("auth.or")}</div>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <form
          className="flex flex-col gap-4"
          onSubmit={handleSubmit(async (values) => {
            try {
              if (!configured) throw new Error("Firebase is not configured (.env.local missing).");
              const auth = getFirebaseAuth();
              if (!auth) throw new Error("Firebase auth is not available.");
              const cred = await createUserWithEmailAndPassword(
                auth,
                values.email,
                values.password
              );
              await updateProfile(cred.user, { displayName: values.displayName });
              router.replace(next);
            } catch (e: unknown) {
              pushToast(e instanceof Error ? e.message : "Sign-up failed");
            }
          })}
        >
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-white/80">{t("auth.displayName")}</span>
            <Input type="text" autoComplete="nickname" {...register("displayName")} />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-white/80">{t("auth.email")}</span>
            <Input type="email" autoComplete="email" {...register("email")} />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-white/80">{t("auth.password")}</span>
            <Input type="password" autoComplete="new-password" {...register("password")} />
          </label>

          <Button className="mt-2 w-full" disabled={isSubmitting || !configured} type="submit">
            {isSubmitting ? t("auth.creating") : t("auth.signUpTitle")}
          </Button>
        </form>

        <div className="mt-5 text-sm text-[var(--muted)]">
          {t("auth.haveAccountAlready")}{" "}
          <Link className="font-medium text-white hover:underline" href="/login">
            {t("auth.signInTitle")}
          </Link>
        </div>
      </Card>
      </div>
    </div>
  );
}

