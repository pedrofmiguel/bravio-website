"use client";

import { useId, useRef, useState } from "react";
import { useLang } from "@/lib/lang-context";
import { ArrowButton } from "@/components/ui/ArrowLink";

/**
 * Enquiry form.
 *
 * Posts to /api/contact, which is where the Gmail transport gets wired in.
 * Validation is deliberately gentle: it runs on submit, and a field that has
 * already been corrected clears its own error as you type, so nobody is
 * scolded mid-sentence.
 */

type Status = "idle" | "sending" | "sent" | "error";
type FieldName = "name" | "email" | "message";
type Errors = Partial<Record<FieldName, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function ContactForm() {
  const { t, lang } = useLang();
  const f = t.contact.form;

  const uid = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Errors>({});

  const fieldId = (name: string) => `${uid}-${name}`;
  const errorId = (name: string) => `${uid}-${name}-error`;

  const clearError = (name: FieldName) =>
    setErrors((prev) => (prev[name] ? { ...prev, [name]: undefined } : prev));

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);

    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();

    const next: Errors = {};
    if (!name) next.name = f.required.name;
    if (!email) next.email = f.required.email;
    else if (!EMAIL_RE.test(email)) next.email = f.required.emailInvalid;
    if (!message) next.message = f.required.message;

    setErrors(next);
    if (Object.keys(next).length > 0) {
      // Send focus to the first thing that needs attention.
      const first = Object.keys(next)[0];
      formRef.current
        ?.querySelector<HTMLElement>(`[name="${first}"]`)
        ?.focus();
      return;
    }

    setStatus("sending");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          message,
          phone: String(data.get("phone") ?? "").trim(),
          date: String(data.get("date") ?? ""),
          guests: String(data.get("guests") ?? ""),
          occasion: String(data.get("occasion") ?? ""),
          company: String(data.get("company") ?? ""),
          lang,
        }),
      });
      if (!response.ok) throw new Error(`Request failed: ${response.status}`);
      setStatus("sent");
      formRef.current?.reset();
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div role="status" className="border-t border-rule pt-10">
        <p className="font-display type-title">{f.successTitle}</p>
        <p className="type-lead mt-4 max-w-[44ch] text-ink-muted">
          {f.successBody}
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-8 pb-1 text-[0.95rem] underline underline-offset-4 transition-opacity hover:opacity-60"
        >
          {f.again}
        </button>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate className="w-full">
      {/* Honeypot. Hidden from people and from screen readers, visible to the
          bots that fill in every field they can find. */}
      <div aria-hidden="true" className="absolute left-[-9999px] h-px w-px overflow-hidden">
        <label htmlFor={fieldId("company")}>Company</label>
        <input
          id={fieldId("company")}
          name="company"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="grid grid-cols-1 gap-x-8 gap-y-7 sm:grid-cols-2">
        <Field
          label={f.name}
          name="name"
          id={fieldId("name")}
          error={errors.name}
          errorId={errorId("name")}
          onInput={() => clearError("name")}
          autoComplete="name"
        />
        <Field
          label={f.email}
          name="email"
          type="email"
          id={fieldId("email")}
          error={errors.email}
          errorId={errorId("email")}
          onInput={() => clearError("email")}
          autoComplete="email"
        />
        <Field
          label={f.phone}
          hint={f.phoneOptional}
          name="phone"
          type="tel"
          id={fieldId("phone")}
          autoComplete="tel"
        />
        <Field
          label={f.date}
          name="date"
          type="date"
          id={fieldId("date")}
        />
        <Field
          label={f.guests}
          name="guests"
          type="number"
          inputMode="numeric"
          min={1}
          id={fieldId("guests")}
        />

        <div className="flex flex-col gap-2">
          <label htmlFor={fieldId("occasion")} className="type-label text-ink-muted">
            {f.occasion}
          </label>
          <select
            id={fieldId("occasion")}
            name="occasion"
            defaultValue={f.occasions[0]}
            className="w-full appearance-none border-b border-rule bg-transparent pb-2.5 text-[1rem] text-ink transition-colors focus:border-accent focus:outline-none"
          >
            {f.occasions.map((option) => (
              <option key={option} value={option} className="bg-ground text-ink">
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2 sm:col-span-2">
          <label htmlFor={fieldId("message")} className="type-label text-ink-muted">
            {f.message}
          </label>
          <textarea
            id={fieldId("message")}
            name="message"
            rows={4}
            placeholder={f.messagePlaceholder}
            aria-invalid={Boolean(errors.message)}
            aria-describedby={errors.message ? errorId("message") : undefined}
            onInput={() => clearError("message")}
            className={`w-full resize-y border-b bg-transparent pb-2.5 text-[1rem] text-ink placeholder:text-ink/40 transition-colors focus:outline-none ${
              errors.message ? "border-accent" : "border-rule focus:border-accent"
            }`}
          />
          {errors.message ? (
            <p id={errorId("message")} className="text-[0.82rem] text-accent">
              {errors.message}
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-10 flex flex-wrap items-center gap-5">
        <ArrowButton type="submit" disabled={status === "sending"}>
          {status === "sending" ? f.sending : f.submit}
        </ArrowButton>

        {status === "error" ? (
          <p role="alert" className="max-w-[40ch] text-[0.85rem] text-accent">
            {f.errorGeneric}
          </p>
        ) : null}
      </div>
    </form>
  );
}

function Field({
  label,
  hint,
  name,
  id,
  error,
  errorId,
  type = "text",
  ...rest
}: {
  label: string;
  hint?: string;
  name: string;
  id: string;
  error?: string;
  errorId?: string;
  type?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="type-label flex items-baseline gap-2 text-ink-muted">
        {label}
        {hint ? (
          <span className="tracking-normal normal-case opacity-60">({hint})</span>
        ) : null}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        aria-invalid={Boolean(error)}
        aria-describedby={error && errorId ? errorId : undefined}
        className={`w-full border-b bg-transparent pb-2.5 text-[1rem] text-ink placeholder:text-ink/40 transition-colors focus:outline-none ${
          error ? "border-accent" : "border-rule focus:border-accent"
        }`}
        {...rest}
      />
      {error && errorId ? (
        <p id={errorId} className="text-[0.82rem] text-accent">
          {error}
        </p>
      ) : null}
    </div>
  );
}
