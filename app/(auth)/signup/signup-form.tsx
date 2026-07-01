"use client";

// Signup form — P-AUTH-02 (Doc-7E §2). Client Component holding only ephemeral form state
// (Doc-7C §2.3). PRESENTATION-ONLY: client-side validation is UX only (never an authorization
// decision — the server is the final authority, Doc-7A). It performs NO mutation and calls NO
// contract: account creation is deferred (`[ESC-7-API-SIGNUP]`), so a valid submit shows an honest
// interim notice and fabricates no account. Composes the shared kit (FormField / Input / Button); the
// consent control is a native checkbox (no kit checkbox primitive exists yet) wired for a11y by hand.
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Info } from "lucide-react";
import { FormField } from "@/frontend/components/form-field";
import { Input } from "@/frontend/primitives/input";
import { Button } from "@/frontend/primitives/button";

interface FieldErrors {
  name?: string;
  email?: string;
  password?: string;
  confirm?: string;
  terms?: string;
}

// Presentation-level email shape check only (UX hint — the server validates for real).
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 8;

export function SignupForm() {
  const [values, setValues] = useState({ name: "", email: "", password: "", confirm: "" });
  const [terms, setTerms] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitted, setSubmitted] = useState(false);

  function set<K extends keyof typeof values>(key: K, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function validate(): FieldErrors {
    const next: FieldErrors = {};
    if (values.name.trim().length === 0) next.name = "Enter your full name.";
    if (values.email.trim().length === 0) next.email = "Enter your work email.";
    else if (!EMAIL_RE.test(values.email.trim())) next.email = "Enter a valid email address.";
    if (values.password.length < MIN_PASSWORD)
      next.password = `Use at least ${MIN_PASSWORD} characters.`;
    if (values.confirm !== values.password) next.confirm = "Passwords do not match.";
    if (!terms) next.terms = "Please accept the Terms and Privacy Policy to continue.";
    return next;
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = validate();
    setErrors(next);
    // Presentation-only: on a clean form there is no wired mutation — show the honest interim.
    if (Object.keys(next).length === 0) setSubmitted(true);
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      {submitted ? (
        <div
          role="status"
          className="flex items-start gap-2 rounded-md border border-border bg-iv-info-subtle px-3 py-2 text-sm text-iv-info-muted"
        >
          <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <p>
            Account creation is coming online soon — you’ll be able to finish signing up here
            shortly. Nothing was submitted.
          </p>
        </div>
      ) : null}

      <FormField id="signup-name" label="Full name" required error={errors.name}>
        <Input
          name="name"
          type="text"
          autoComplete="name"
          placeholder="e.g. Anisur Rahman"
          value={values.name}
          onChange={(e) => set("name", e.target.value)}
        />
      </FormField>

      <FormField id="signup-email" label="Work email" required error={errors.email}>
        <Input
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@company.com.bd"
          value={values.email}
          onChange={(e) => set("email", e.target.value)}
        />
      </FormField>

      <FormField
        id="signup-password"
        label="Password"
        required
        description={`Use at least ${MIN_PASSWORD} characters.`}
        error={errors.password}
      >
        <Input
          name="password"
          type="password"
          autoComplete="new-password"
          value={values.password}
          onChange={(e) => set("password", e.target.value)}
        />
      </FormField>

      <FormField id="signup-confirm" label="Confirm password" required error={errors.confirm}>
        <Input
          name="confirm"
          type="password"
          autoComplete="new-password"
          value={values.confirm}
          onChange={(e) => set("confirm", e.target.value)}
        />
      </FormField>

      <div className="space-y-1.5">
        <div className="flex items-start gap-2">
          <input
            id="signup-terms"
            type="checkbox"
            checked={terms}
            onChange={(e) => setTerms(e.target.checked)}
            aria-describedby={errors.terms ? "signup-terms-error" : undefined}
            aria-invalid={errors.terms ? true : undefined}
            className="mt-0.5 size-4 shrink-0 rounded border-input accent-iv-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          />
          <label htmlFor="signup-terms" className="text-sm text-muted-foreground">
            I agree to the{" "}
            {/* Legal views (P-PUB-21/-22) are not yet built — placeholdered to "/" per the footer convention. */}
            <Link
              href="/"
              className="rounded-sm font-medium text-iv-navy-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/"
              className="rounded-sm font-medium text-iv-navy-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Privacy Policy
            </Link>
            .
          </label>
        </div>
        {errors.terms ? (
          <p id="signup-terms-error" className="text-sm text-destructive">
            {errors.terms}
          </p>
        ) : null}
      </div>

      <Button type="submit" className="w-full" disabled={submitted}>
        Create account
      </Button>
    </form>
  );
}
