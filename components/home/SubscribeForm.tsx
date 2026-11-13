"use client";

import { useActionState, useState, type FormEvent, type ReactNode } from "react";
import { subscribe, type SubscribeResult } from "@/app/actions/subscribe";
import { business, connect } from "@/lib/content/site";
import { EMAIL } from "@/lib/forms";

/** "Sign up to hear from us." Says it worked only when the server confirms. */
export default function SubscribeForm() {
  const [result, action, pending] = useActionState<SubscribeResult | null, FormData>(subscribe, null);
  const [invalid, setInvalid] = useState(false);
  const { signup } = connect;

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    const email = String(new FormData(e.currentTarget).get("email") ?? "").trim();
    const bad = !EMAIL.test(email);
    setInvalid(bad);
    if (bad) e.preventDefault();
  };

  let message: ReactNode = null;
  if (invalid || (result && !result.ok && result.reason === "invalid")) message = signup.ui.invalid;
  else if (result?.ok) message = signup.ui.sent;
  else if (result && !result.ok) {
    const mailto = `mailto:${business.email}?subject=${encodeURIComponent("Sign me up")}`;
    message = (
      <>
        {signup.ui.fallback} <a href={mailto}>{signup.ui.openDraft}</a>
      </>
    );
  }

  return (
    <form className="sub-form" action={action} onSubmit={onSubmit} noValidate>
      <label htmlFor="s-email">{signup.field}</label>
      <div className="sub-row">
        <input id="s-email" name="email" type="email" autoComplete="email" placeholder={signup.field} required aria-invalid={invalid || undefined} aria-describedby="s-msg" />
        <button className="btn" type="submit" disabled={pending}>
          {signup.submit}
        </button>
      </div>
      <p className="sub-msg" id="s-msg" role="status" aria-live="polite" hidden={!message}>
        {message}
      </p>
    </form>
  );
}
