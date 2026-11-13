"use server";

import { business, serviceOptions } from "@/lib/content/site";
import { phoneOk } from "@/lib/forms";

export type AppointmentResult =
  | { ok: true }
  | {
      ok: false;
      reason: "invalid" | "not-configured" | "failed";
      /** the request as plain text, so the visitor can send it themselves */
      draft?: string;
    };

const text = (v: FormDataEntryValue | null, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

/**
 * Receives the appointment request: exactly what the client's copy asks for
 * (name, phone number, the service being requested) plus an optional note.
 * Validates, then delivers through Resend when it is configured
 * (adapted from Blueprint's inquiry action):
 *
 *   RESEND_API_KEY   Resend API key
 *   INQUIRY_TO       where requests go (e.g. truelabresults@mobilelabdraws.org)
 *   INQUIRY_FROM     a sender on a domain verified with Resend
 *
 * TODO(client): choose and configure the email provider. Until then this
 * returns { ok: false, reason: "not-configured" } with a ready-made email
 * draft, and the form offers that and the phone number instead. It reports ok
 * only when delivery succeeded.
 */
export async function requestAppointment(_prev: AppointmentResult | null, formData: FormData): Promise<AppointmentResult> {
  const name = text(formData.get("name"), 200);
  const phone = text(formData.get("phone"), 40);
  const rawService = text(formData.get("service"), 200);
  const service = serviceOptions.includes(rawService) ? rawService : "";
  if (!name || !phoneOk(phone) || !service) return { ok: false, reason: "invalid" };
  const note = text(formData.get("note"), 3000);

  const draft = `Appointment request\nName: ${name}\nPhone: ${phone}\nService: ${service}${note ? `\n\n${note}` : ""}`;

  const key = process.env.RESEND_API_KEY;
  const to = process.env.INQUIRY_TO;
  const from = process.env.INQUIRY_FROM;
  if (!key || !to || !from) return { ok: false, reason: "not-configured", draft };

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [to],
        subject: `Appointment request: ${service} (${name})`,
        text: `${draft}\n\n— sent from the ${business.name} website`,
      }),
      signal: AbortSignal.timeout(20_000),
    });
    if (!res.ok) return { ok: false, reason: "failed", draft };
    return { ok: true };
  } catch {
    return { ok: false, reason: "failed", draft };
  }
}
