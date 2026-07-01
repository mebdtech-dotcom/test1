"use client";

// Two-factor challenge form — P-AUTH-06 (Doc-7E §2). Client Component holding only ephemeral form
// state (Doc-7C §2.3). PRESENTATION-ONLY: client-side validation is FORMAT-only UX (the code and the
// MFA challenge are SERVER-authoritative); it performs NO verification and completes NO sign-in —
// submitting a well-formed code shows an honest interim. Composes the shared kit
// (FormField / Input / Button). Supports the authenticator (TOTP) code and a backup recovery code.
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { AlertCircle, Info, Loader2, ShieldCheck } from "lucide-react";
import { FormField } from "@/frontend/components/form-field";
import { Input } from "@/frontend/primitives/input";
import { Button } from "@/frontend/primitives/button";
import { cn } from "@/frontend/lib/cn";

const TOTP_RE = /^\d{6}$/;
const MIN_BACKUP = 8;

export function TwoFactorForm({ preview }: { preview?: "loading" | "error" | "interim" }) {
  const [mode, setMode] = useState<"totp" | "backup">("totp");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string>();
  const [done, setDone] = useState(preview === "interim");
  // Loading is a DEV/QA preview only — there is no real async verify in this presentation build.
  const loading = preview === "loading";
  // A server-rejected code renders a uniform, non-format error (DEV/QA preview).
  const serverError = preview === "error";

  function switchMode(next: "totp" | "backup") {
    setMode(next);
    setCode("");
    setError(undefined);
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = code.trim();
    if (mode === "totp" && !TOTP_RE.test(value)) {
      setError("Enter the 6-digit code from your authenticator app.");
      return;
    }
    if (mode === "backup" && value.length < MIN_BACKUP) {
      setError("Enter a valid backup code.");
      return;
    }
    setError(undefined);
    // Presentation-only: nothing is verified (the server owns the real challenge) — honest interim.
    setDone(true);
  }

  if (done) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col items-center gap-2 rounded-md border border-border bg-iv-info-subtle px-4 py-5 text-center">
          <ShieldCheck aria-hidden="true" className="size-6 text-iv-info-muted" />
          <h2 className="text-base font-semibold text-iv-ink-heading">Almost there</h2>
          <p className="text-sm text-iv-info-muted" role="status">
            Two-factor verification is coming online soon — you’ll be able to finish here shortly.
            Nothing was verified.
          </p>
        </div>
        <Button asChild variant="outline" className="w-full">
          <Link href="/login">Back to sign in</Link>
        </Button>
      </div>
    );
  }

  const isTotp = mode === "totp";

  return (
    <form onSubmit={onSubmit} noValidate aria-busy={loading} className="space-y-4">
      {serverError ? (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-md border border-border bg-iv-danger-subtle px-3 py-2 text-sm text-iv-danger-muted"
        >
          <AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <p>That code isn’t valid or has expired. Please try again.</p>
        </div>
      ) : null}

      <FormField
        id="two-factor-code"
        label={isTotp ? "Authentication code" : "Backup code"}
        required
        description={
          isTotp
            ? "Enter the 6-digit code from your authenticator app."
            : "Enter one of the backup codes you saved when you set up 2FA."
        }
        error={error}
      >
        <Input
          name="code"
          type="text"
          inputMode={isTotp ? "numeric" : "text"}
          autoComplete="one-time-code"
          maxLength={isTotp ? 6 : 32}
          disabled={loading}
          placeholder={isTotp ? "123456" : "xxxx-xxxx"}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className={cn(isTotp && "text-center text-lg font-medium tracking-[0.4em]")}
        />
      </FormField>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <>
            <Loader2 aria-hidden="true" className="animate-spin" />
            Verifying…
          </>
        ) : (
          "Verify"
        )}
      </Button>

      <div className="flex items-start gap-2 border-t border-border pt-4 text-xs text-muted-foreground">
        <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
        <p>
          {isTotp ? (
            <>
              Lost your device?{" "}
              <button
                type="button"
                onClick={() => switchMode("backup")}
                className="rounded-sm font-medium text-iv-navy-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Use a backup code
              </button>
              .
            </>
          ) : (
            <>
              Have your device?{" "}
              <button
                type="button"
                onClick={() => switchMode("totp")}
                className="rounded-sm font-medium text-iv-navy-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Use your authenticator app
              </button>
              .
            </>
          )}
        </p>
      </div>
    </form>
  );
}
