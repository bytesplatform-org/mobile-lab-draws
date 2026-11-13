"use client";

import { useActionState, useRef, useState, type CSSProperties, type FormEvent, type ReactNode } from "react";
import { requestAppointment, type AppointmentResult } from "@/app/actions/appointment";
import { business, contact, serviceOptions } from "@/lib/content/site";
import { phoneOk } from "@/lib/forms";
import { Arrow } from "@/components/site/Icons";

/**
 * The appointment request: exactly what the copy asks for (name, phone
 * number, the service being requested) plus an optional note. Posts to the
 * requestAppointment Server Action (it works without JS too). It says "sent"
 * only when the server confirms delivery; otherwise it offers the request as
 * a ready-made email and the phone number.
 */
export default function AppointmentForm() {
  const [result, action, pending] = useActionState<AppointmentResult | null, FormData>(requestAppointment, null);
  const [invalid, setInvalid] = useState<string[]>([]);
  const nameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const serviceRef = useRef<HTMLSelectElement>(null);
  const { form } = contact;

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    const bad: string[] = [];
    if (!nameRef.current?.value.trim()) bad.push("name");
    if (!phoneOk(phoneRef.current?.value.trim() ?? "")) bad.push("phone");
    if (!serviceRef.current?.value) bad.push("service");
    setInvalid(bad);
    if (bad.length) {
      e.preventDefault();
      ({ name: nameRef, phone: phoneRef, service: serviceRef })[bad[0] as "name"].current?.focus();
    }
  };

  let message: ReactNode = null;
  if (invalid.length || (result && !result.ok && result.reason === "invalid")) message = form.ui.invalid;
  else if (result?.ok) message = form.ui.sent;
  else if (result && !result.ok) {
    const mailto = `mailto:${business.email}?subject=${encodeURIComponent("Appointment request")}&body=${encodeURIComponent(result.draft ?? "")}`;
    message = (
      <>
        {form.ui.fallback} <a href={mailto}>{form.ui.openDraft}</a>, <a href={business.phoneHref}>{form.ui.orCall}</a>.
      </>
    );
  }
  const err = (field: string) => (invalid.includes(field) ? { "aria-invalid": true, "aria-describedby": "f-msg" } : {});

  return (
    <form className="appt" action={action} onSubmit={onSubmit} noValidate data-reveal="settle" style={{ "--i": 1 } as CSSProperties}>
      <div className="f2">
        <label htmlFor="f-name">
          {form.name}
          <input id="f-name" name="name" autoComplete="name" required ref={nameRef} {...err("name")} />
        </label>
        <label htmlFor="f-phone">
          {form.phone}
          <input id="f-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" required ref={phoneRef} {...err("phone")} />
        </label>
      </div>
      <label htmlFor="f-service">
        {form.service}
        <select id="f-service" name="service" required defaultValue="" ref={serviceRef} {...err("service")}>
          <option value="" disabled>{form.servicePlaceholder}</option>
          {serviceOptions.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </label>
      <label htmlFor="f-note">
        {form.note}
        <textarea id="f-note" name="note" rows={3} />
      </label>
      <p className="form-msg" id="f-msg" role="status" aria-live="polite" hidden={!message}>
        {message}
      </p>
      <button className="btn ink lg" type="submit" disabled={pending}>
        {pending ? form.ui.sending : form.submit}
        <Arrow />
      </button>
    </form>
  );
}
