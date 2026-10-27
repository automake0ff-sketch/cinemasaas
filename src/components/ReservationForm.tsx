"use client";
import { useEffect, useRef, useState } from "react";
import { restaurant } from "@/config/restaurant";

type Service = "comida" | "cena";
type Errors = Partial<Record<"date" | "party" | "time" | "name" | "phone" | "email", string>>;
const today = () => new Date().toLocaleDateString("en-CA", { timeZone: restaurant.timezone });
const field = "w-full border-0 border-b border-humo/50 bg-transparent px-0 py-3 text-marfil placeholder:text-humo/60 focus:border-oro focus:outline-none";
const lbl = "block text-xs uppercase tracking-[0.2em] text-humo";

export default function ReservationForm() {
  const [step, setStep] = useState(1);
  const [date, setDate] = useState(""); const [service, setService] = useState<Service>("comida"); const [party, setParty] = useState(2);
  const [slots, setSlots] = useState<string[] | null>(null); const [time, setTime] = useState("");
  const [data, setData] = useState({ name: "", phone: "", email: "", notes: "" });
  const [errors, setErrors] = useState<Errors>({}); const [notice, setNotice] = useState<{ kind: "error" | "info"; text: string } | null>(null);
  const [busy, setBusy] = useState(false); const [done, setDone] = useState(false);
  const [key] = useState(() => crypto.randomUUID());
  const head = useRef<HTMLHeadingElement>(null);
  useEffect(() => { head.current?.focus(); }, [step, done]);

  async function search() {
    const e: Errors = {};
    if (!date) e.date = "Elige una fecha."; else if (date < today()) e.date = "La fecha ya ha pasado.";
    if (!Number.isInteger(party) || party < restaurant.minParty || party > restaurant.maxParty) e.party = `Entre ${restaurant.minParty} y ${restaurant.maxParty} comensales. Para grupos mayores, contacta con el restaurante.`;
    setErrors(e); setNotice(null); if (Object.keys(e).length) return;
    setBusy(true); setTime("");
    try {
      const r = await fetch(`/api/availability?service=${service}&date=${date}&party=${party}`); const j = await r.json();
      if (!r.ok) { setSlots(null); setNotice({ kind: "info", text: r.status === 503 ? "Las reservas online todavía no están activadas. Contacta con el restaurante para reservar." : (j.error ?? "No se pudo consultar la disponibilidad.") }); }
      else { setSlots(j.slots); if (j.slots.length) setStep(2); else setNotice({ kind: "info", text: "No hay huecos para esa fecha, servicio y número de comensales. Prueba con otro día o servicio." }); }
    } catch { setNotice({ kind: "error", text: "No se pudo conectar. Inténtalo de nuevo." }); }
    setBusy(false);
  }
  function toDetails() { if (!time) { setErrors({ time: "Elige una hora." }); return; } setErrors({}); setStep(3); }
  async function submit(ev: React.FormEvent) {
    ev.preventDefault(); if (busy) return;
    const e: Errors = {};
    if (data.name.trim().length < 2) e.name = "Indica tu nombre.";
    if (data.phone.replace(/\D/g, "").length < 9) e.phone = "Teléfono de al menos 9 dígitos.";
    if (!/^\S+@\S+\.\S+$/.test(data.email.trim())) e.email = "Correo no válido.";
    setErrors(e); if (Object.keys(e).length) return;
    setBusy(true); setNotice(null);
    try {
      const r = await fetch("/api/reservations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ date, service, party, time, name: data.name, phone: data.phone, email: data.email, notes: data.notes || undefined, idempotencyKey: key }) });
      const j = await r.json().catch(() => ({}));
      if (r.status === 201) setDone(true); // solo tras la confirmación del servidor
      else setNotice({ kind: r.status === 503 ? "info" : "error", text: j.error ?? "No se pudo completar la reserva." });
    } catch { setNotice({ kind: "error", text: "No se pudo conectar. Tu reserva NO se ha realizado; inténtalo de nuevo." }); }
    setBusy(false);
  }
  const err = (k: keyof Errors) => errors[k] && <p id={`e-${k}`} className="mt-1 text-sm text-[#F29A86]">{errors[k]}</p>;
  const aria = (k: keyof Errors) => ({ "aria-invalid": !!errors[k], "aria-describedby": errors[k] ? `e-${k}` : undefined });

  if (done) return (
    <div role="status" className="border border-oro/40 p-8">
      <h3 ref={head} tabIndex={-1} className="font-serif text-3xl text-oro">Reserva confirmada</h3>
      <p className="mt-3">{party} {party === 1 ? "persona" : "personas"} · {date} · {time} ({service}). A nombre de {data.name}.</p>
    </div>
  );
  return (
    <form onSubmit={submit} noValidate aria-busy={busy} className="max-w-xl">
      <ol className="mb-8 flex gap-6 text-xs uppercase tracking-[0.2em]" aria-label="Pasos de la reserva">
        {["Fecha", "Hora", "Tus datos"].map((t, i) => <li key={t} aria-current={step === i + 1 ? "step" : undefined} className={step === i + 1 ? "text-oro" : "text-humo/60"}>{i + 1}. {t}</li>)}
      </ol>
      {step === 1 && (
        <div className="grid gap-6">
          <h3 ref={head} tabIndex={-1} className="font-serif text-2xl">¿Cuándo venís?</h3>
          <div><label htmlFor="date" className={lbl}>Fecha</label><input id="date" type="date" min={today()} value={date} onChange={e => setDate(e.target.value)} className={field} {...aria("date")} />{err("date")}</div>
          <fieldset><legend className={lbl}>Servicio</legend>
            <div className="mt-2 flex gap-3">{(["comida", "cena"] as const).map(s => <button type="button" key={s} aria-pressed={service === s} onClick={() => setService(s)} className="btn flex-1 border border-oro/50 capitalize aria-pressed:bg-oro aria-pressed:text-carbon">{s}</button>)}</div></fieldset>
          <div><label htmlFor="party" className={lbl}>Comensales</label><input id="party" type="number" inputMode="numeric" min={restaurant.minParty} max={restaurant.maxParty} value={party} onChange={e => setParty(Number(e.target.value))} className={field} {...aria("party")} />{err("party")}</div>
          <button type="button" onClick={search} disabled={busy} className="btn btn-primary disabled:opacity-50">{busy ? "Consultando…" : "Ver disponibilidad"}</button>
        </div>
      )}
      {step === 2 && (
        <div className="grid gap-6">
          <h3 ref={head} tabIndex={-1} className="font-serif text-2xl">Elige la hora</h3>
          <div role="radiogroup" aria-label="Hora" className="flex flex-wrap gap-2">{(slots ?? []).map(t => <button type="button" role="radio" aria-checked={time === t} key={t} onClick={() => setTime(t)} className="btn min-w-20 border border-oro/50 aria-checked:bg-oro aria-checked:text-carbon">{t}</button>)}</div>
          {err("time")}
          <div className="flex gap-3"><button type="button" onClick={() => setStep(1)} className="btn btn-ghost">Atrás</button><button type="button" onClick={toDetails} className="btn btn-primary">Continuar</button></div>
        </div>
      )}
      {step === 3 && (
        <div className="grid gap-6">
          <h3 ref={head} tabIndex={-1} className="font-serif text-2xl">Tus datos</h3>
          <div><label htmlFor="name" className={lbl}>Nombre</label><input id="name" autoComplete="name" value={data.name} onChange={e => setData({ ...data, name: e.target.value })} className={field} {...aria("name")} />{err("name")}</div>
          <div><label htmlFor="phone" className={lbl}>Teléfono</label><input id="phone" type="tel" autoComplete="tel" value={data.phone} onChange={e => setData({ ...data, phone: e.target.value })} className={field} {...aria("phone")} />{err("phone")}</div>
          <div><label htmlFor="email" className={lbl}>Correo</label><input id="email" type="email" autoComplete="email" value={data.email} onChange={e => setData({ ...data, email: e.target.value })} className={field} {...aria("email")} />{err("email")}</div>
          <div><label htmlFor="notes" className={lbl}>Observaciones (opcional)</label><textarea id="notes" rows={2} maxLength={500} value={data.notes} onChange={e => setData({ ...data, notes: e.target.value })} className={field} /></div>
          <p className="text-sm text-humo">Usaremos tus datos solo para gestionar esta reserva. [Pendiente: enlace a la política de privacidad del restaurante]</p>
          <div className="flex gap-3"><button type="button" onClick={() => setStep(2)} className="btn btn-ghost">Atrás</button><button disabled={busy} className="btn btn-primary disabled:opacity-50">{busy ? "Enviando…" : "Confirmar reserva"}</button></div>
        </div>
      )}
      {notice && <p role={notice.kind === "error" ? "alert" : "status"} className={`mt-6 border-l-2 pl-4 ${notice.kind === "error" ? "border-[#F29A86] text-[#F29A86]" : "border-oro text-marfil"}`}>{notice.text}{notice.kind === "info" && <> <a className="underline" href={restaurant.officialUrl} target="_blank" rel="noopener noreferrer">Web oficial</a>.</>}</p>}
    </form>
  );
}
