"use client";
import { useEffect, useRef, useState } from "react";

type Service = "comida" | "cena";
type Status = { enabled: boolean; reason?: string; today: string; maxDate: string; minParty: number; maxParty: number; services: Record<Service, boolean>; phone: string | null; officialUrl: string };
type Notice = { kind: "error" | "info"; text: string };
const FIELDS = ["date", "party", "time", "name", "phone", "email"] as const;
type Errors = Partial<Record<(typeof FIELDS)[number], string>>;

const field = "w-full border-0 border-b border-[color:var(--line)] bg-transparent px-0 py-3 focus:border-[color:var(--acc)] focus:outline-none";
const lbl = "mut block text-xs uppercase tracking-[0.2em]";
const addDays = (d: string, n: number) => { const [y, m, dd] = d.split("-").map(Number); return new Date(Date.UTC(y, m - 1, dd + n)).toISOString().slice(0, 10); };
const pretty = (d: string) => new Intl.DateTimeFormat("es-ES", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" }).format(new Date(`${d}T12:00:00Z`));
const newKey = () => crypto.randomUUID();

export default function ReservationForm() {
  const [st, setSt] = useState<Status | null>(null); const [stErr, setStErr] = useState(false);
  const [step, setStep] = useState(1);
  const [date, setDate] = useState(""); const [service, setService] = useState<Service>("comida"); const [party, setParty] = useState(2);
  const [slots, setSlots] = useState<string[] | null>(null); const [time, setTime] = useState("");
  const [data, setData] = useState({ name: "", phone: "", email: "", notes: "", website: "" });
  const [errors, setErrors] = useState<Errors>({}); const [tick, setTick] = useState(0);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [busy, setBusy] = useState(false); const [done, setDone] = useState<{ id: string } | null>(null);
  const head = useRef<HTMLHeadingElement>(null); const lock = useRef(false); const ctl = useRef<AbortController | null>(null);
  const key = useRef(newKey()); const lastSig = useRef("");

  const loadStatus = () => { setStErr(false); fetch("/api/booking-status").then(r => r.json()).then((s: Status) => { setSt(s); setService(s.services.comida || !s.services.cena ? "comida" : "cena"); }).catch(() => setStErr(true)); };
  useEffect(loadStatus, []);
  useEffect(() => { head.current?.focus(); }, [step, done]);
  useEffect(() => { // enfoca el primer campo con error tras un intento fallido
    const k = FIELDS.find(f => errors[f]); if (!k || !tick) return;
    document.getElementById(k === "time" ? "time-group" : k)?.focus();
  }, [tick]); // eslint-disable-line react-hooks/exhaustive-deps
  const fail = (e: Errors) => { setErrors(e); setTick(t => t + 1); };
  const clear = (k: keyof Errors) => setErrors(e => ({ ...e, [k]: undefined }));
  const resetSearch = () => { setSlots(null); setTime(""); setNotice(null); };

  async function search(fromSubmit = false) {
    if (!st) return;
    const e: Errors = {};
    if (!date) e.date = "Elige una fecha."; else if (date < st.today) e.date = "Esa fecha ya ha pasado."; else if (date > st.maxDate) e.date = `Solo se puede reservar hasta el ${pretty(st.maxDate)}.`;
    if (!Number.isInteger(party) || party < st.minParty || party > st.maxParty) e.party = `Entre ${st.minParty} y ${st.maxParty} comensales. Para grupos mayores, contacta con el restaurante.`;
    fail(e); if (Object.keys(e).length) return;
    ctl.current?.abort(); const c = (ctl.current = new AbortController());
    setBusy(true); setNotice(null); setTime("");
    try {
      const r = await fetch(`/api/availability?service=${service}&date=${date}&party=${party}`, { signal: c.signal }); const j = await r.json();
      if (c.signal.aborted) return;
      if (!r.ok) { setSlots(null); setStep(1); setNotice({ kind: r.status === 503 ? "info" : "error", text: j.error ?? "No se pudo consultar la disponibilidad." }); }
      else if (j.slots.length) { setSlots(j.slots); setStep(2); if (fromSubmit) setNotice({ kind: "info", text: "Ese horario se acaba de completar. Elige otra hora." }); }
      else { setSlots(null); setStep(1); setNotice({ kind: "info", text: ({ CLOSED: "Ese día el restaurante está cerrado.", PAST: "Esa fecha ya ha pasado.", TOO_FAR: "Todavía no se admiten reservas para esa fecha." } as Record<string, string>)[j.code] ?? "No quedan mesas para esa fecha, servicio y número de comensales. Prueba con otro día u otro servicio." }); }
    } catch (err) { if ((err as Error).name !== "AbortError") setNotice({ kind: "error", text: "No se pudo conectar. Comprueba tu conexión e inténtalo de nuevo." }); }
    if (!c.signal.aborted) setBusy(false);
  }
  function toDetails() { if (!time) { fail({ time: "Elige una hora de las disponibles." }); return; } setErrors({}); setStep(3); }

  async function submit(ev: React.FormEvent) {
    ev.preventDefault(); if (lock.current) return; // bloqueo síncrono: un doble clic no envía dos veces
    const e: Errors = {};
    if (data.name.trim().length < 2) e.name = "Indica tu nombre.";
    if (!/^\+?\d{9,15}$/.test(data.phone.replace(/[\s().-]/g, ""))) e.phone = "Teléfono no válido (9 a 15 dígitos).";
    if (!/^\S+@\S+\.\S+$/.test(data.email.trim())) e.email = "Correo no válido.";
    fail(e); if (Object.keys(e).length) return;
    const payload = { date, service, party, time, name: data.name, phone: data.phone, email: data.email, notes: data.notes || undefined, website: data.website };
    const sig = JSON.stringify(payload); if (lastSig.current && lastSig.current !== sig) key.current = newKey(); lastSig.current = sig; // misma clave solo si los datos no cambian
    lock.current = true; setBusy(true); setNotice(null);
    try {
      const r = await fetch("/api/reservations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...payload, idempotencyKey: key.current }), signal: AbortSignal.timeout(20000) });
      const j = await r.json().catch(() => ({}));
      if (r.status === 201) { setDone({ id: j.id }); }
      else if (r.status === 400 && j.fieldErrors) { const fe = j.fieldErrors as Errors; fail(fe); if (fe.date || fe.party || fe.time) setStep(1); setNotice({ kind: "error", text: j.error }); }
      else if (r.status === 409 && (j.code === "FULL" || j.code === "SLOT_UNAVAILABLE")) { await search(true); }
      else if (r.status === 409 && j.code === "KEY_CONFLICT") { key.current = newKey(); setNotice({ kind: "error", text: j.error }); }
      else if (r.status === 429) setNotice({ kind: "error", text: `${j.error}${j.retryAfter ? ` (prueba en ${Math.ceil(j.retryAfter / 60)} min)` : ""}` });
      else setNotice({ kind: r.status === 503 ? "info" : "error", text: j.error ?? "No se pudo completar la reserva." });
    } catch { setNotice({ kind: "error", text: "No hemos recibido respuesta del servidor, así que no podemos asegurar que la reserva se haya registrado. Puedes volver a pulsar «Confirmar reserva»: si ya se registró, no se duplicará." }); }
    lock.current = false; setBusy(false);
  }
  const err = (k: keyof Errors) => errors[k] && <p id={`e-${k}`} className="mt-1 text-sm text-[color:var(--err)]">{errors[k]}</p>;
  const aria = (k: keyof Errors) => ({ "aria-invalid": !!errors[k], "aria-describedby": errors[k] ? `e-${k}` : undefined });

  // Estados previos al formulario
  if (stErr) return <div role="alert" className="border border-[color:var(--line)] p-6"><p>No se pudo comprobar el estado de las reservas.</p><button onClick={loadStatus} className="btn btn-ghost mt-4">Reintentar</button></div>;
  if (!st) return <p role="status" className="mut">Comprobando reservas…</p>;
  if (!st.enabled) return (
    <div role="status" className="border border-[color:var(--line)] p-6 md:p-8">
      <h3 ref={head} tabIndex={-1} className="display text-2xl">Reservas online no disponibles todavía</h3>
      <p className="mut mt-3 max-w-md">Todavía no hay un sistema de reservas conectado a esta web, así que no mostramos huecos ni confirmamos mesas. Para reservar, contacta directamente con el restaurante.</p>
      <div className="mt-6 flex flex-wrap gap-3">
        {st.phone && <a className="btn btn-primary" href={`tel:${st.phone.replace(/\s/g, "")}`}>Llamar: {st.phone}</a>}
        <a className="btn btn-ghost" href={st.officialUrl} target="_blank" rel="noopener noreferrer">Web oficial</a>
      </div>
    </div>
  );
  if (done) return (
    <div role="status" className="border border-[color:var(--acc)] p-8">
      <h3 ref={head} tabIndex={-1} className="display acc text-3xl">Reserva confirmada</h3>
      <p className="mt-3 first-letter:uppercase">{party} {party === 1 ? "persona" : "personas"} · {pretty(date)} · {time} ({service}) · a nombre de {data.name}.</p>
      <p className="mut mt-2 text-sm">Referencia: {done.id.slice(0, 8).toUpperCase()}</p>
      <button className="btn btn-ghost mt-6" onClick={() => { setDone(null); setStep(1); resetSearch(); setDate(""); key.current = newKey(); lastSig.current = ""; setData({ name: "", phone: "", email: "", notes: "", website: "" }); }}>Hacer otra reserva</button>
    </div>
  );

  return (
    <form onSubmit={submit} noValidate aria-busy={busy} className="max-w-xl">
      <ol className="mb-8 flex gap-6 text-xs uppercase tracking-[0.2em]" aria-label="Pasos de la reserva">
        {["Fecha", "Hora", "Tus datos"].map((t, i) => <li key={t} aria-current={step === i + 1 ? "step" : undefined} className={step === i + 1 ? "acc" : "mut opacity-70"}>{i + 1}. {t}</li>)}
      </ol>
      {step === 1 && (
        <div className="grid gap-7">
          <h3 ref={head} tabIndex={-1} className="display text-2xl">¿Cuándo venís?</h3>
          <div>
            <label htmlFor="date" className={lbl}>Fecha</label>
            <input id="date" type="date" min={st.today} max={st.maxDate} value={date} onChange={e => { setDate(e.target.value); resetSearch(); clear("date"); }} className={field} {...aria("date")} />
            <div className="mt-3 flex gap-2">{[["Hoy", st.today], ["Mañana", addDays(st.today, 1)]].map(([l, d]) => <button type="button" key={l} aria-pressed={date === d} onClick={() => { setDate(d); resetSearch(); clear("date"); }} className="chip min-h-11 px-4 text-sm">{l}</button>)}</div>
            {err("date")}
          </div>
          <fieldset><legend className={lbl}>Servicio</legend>
            <div className="mt-2 flex gap-3">{(["comida", "cena"] as const).map(s => <button type="button" key={s} disabled={!st.services[s]} aria-pressed={service === s} onClick={() => { setService(s); resetSearch(); }} className="btn chip flex-1 capitalize">{s}{!st.services[s] && <span className="text-[10px] normal-case tracking-normal"> · no disponible</span>}</button>)}</div></fieldset>
          <div>
            <span id="party-l" className={lbl}>Comensales</span>
            <div id="party" role="group" aria-labelledby="party-l" tabIndex={-1} className="mt-2 flex items-center gap-4" {...aria("party")}>
              <button type="button" aria-label="Un comensal menos" disabled={party <= st.minParty} onClick={() => { setParty(p => p - 1); resetSearch(); clear("party"); }} className="btn chip !min-h-12 !w-12 !px-0 text-xl">−</button>
              <output aria-live="polite" className="display w-10 text-center text-3xl">{party}</output>
              <button type="button" aria-label="Un comensal más" disabled={party >= st.maxParty} onClick={() => { setParty(p => p + 1); resetSearch(); clear("party"); }} className="btn chip !min-h-12 !w-12 !px-0 text-xl">+</button>
            </div>{err("party")}
          </div>
          <button type="button" onClick={() => search()} disabled={busy} className="btn btn-primary disabled:opacity-50">{busy ? "Consultando disponibilidad…" : "Ver disponibilidad"}</button>
        </div>
      )}
      {step === 2 && (
        <div className="grid gap-6">
          <h3 ref={head} tabIndex={-1} className="display text-2xl">Elige la hora</h3>
          <p className="mut first-letter:uppercase">{pretty(date)} · {service} · {party} {party === 1 ? "persona" : "personas"}</p>
          <fieldset id="time-group" tabIndex={-1} {...aria("time")}><legend className="sr-only">Horas disponibles</legend>
            <div className="flex flex-wrap gap-2">{(slots ?? []).map(t => <label key={t} className="chip btn min-w-20 cursor-pointer"><input type="radio" name="time" value={t} checked={time === t} onChange={() => { setTime(t); clear("time"); }} className="sr-only" />{t}</label>)}</div>
          </fieldset>
          {err("time")}
          <div className="flex gap-3"><button type="button" onClick={() => setStep(1)} className="btn btn-ghost">Atrás</button><button type="button" onClick={toDetails} className="btn btn-primary">Continuar</button></div>
        </div>
      )}
      {step === 3 && (
        <div className="grid gap-6">
          <h3 ref={head} tabIndex={-1} className="display text-2xl">Tus datos</h3>
          <p className="mut first-letter:uppercase">{pretty(date)} · {time} · {service} · {party} {party === 1 ? "persona" : "personas"}</p>
          <div><label htmlFor="name" className={lbl}>Nombre</label><input id="name" autoComplete="name" value={data.name} onChange={e => { setData({ ...data, name: e.target.value }); clear("name"); }} className={field} {...aria("name")} />{err("name")}</div>
          <div><label htmlFor="phone" className={lbl}>Teléfono</label><input id="phone" type="tel" inputMode="tel" autoComplete="tel" value={data.phone} onChange={e => { setData({ ...data, phone: e.target.value }); clear("phone"); }} className={field} {...aria("phone")} />{err("phone")}</div>
          <div><label htmlFor="email" className={lbl}>Correo</label><input id="email" type="email" inputMode="email" autoComplete="email" value={data.email} onChange={e => { setData({ ...data, email: e.target.value }); clear("email"); }} className={field} {...aria("email")} />{err("email")}</div>
          <div><label htmlFor="notes" className={lbl}>Observaciones (opcional)</label><textarea id="notes" rows={2} maxLength={500} value={data.notes} onChange={e => setData({ ...data, notes: e.target.value })} className={field} /></div>
          <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden"><label>No rellenar<input tabIndex={-1} autoComplete="off" name="website" value={data.website} onChange={e => setData({ ...data, website: e.target.value })} /></label></div>
          <p className="mut text-sm">Usaremos tus datos solo para gestionar esta reserva. [Pendiente: enlace a la política de privacidad del restaurante]</p>
          <div className="flex gap-3"><button type="button" onClick={() => setStep(2)} className="btn btn-ghost" disabled={busy}>Atrás</button><button disabled={busy} className="btn btn-primary flex-1 disabled:opacity-50 sm:flex-none">{busy ? "Enviando…" : "Confirmar reserva"}</button></div>
        </div>
      )}
      {notice && <p role={notice.kind === "error" ? "alert" : "status"} className={`mt-6 border-l-2 pl-4 ${notice.kind === "error" ? "border-[color:var(--err)] text-[color:var(--err)]" : "border-[color:var(--acc)]"}`}>{notice.text}{notice.kind === "info" && !/Elige otra|Prueba con/.test(notice.text) && <> <a className="link underline" href={st.officialUrl} target="_blank" rel="noopener noreferrer">Web oficial</a>.</>}</p>}
    </form>
  );
}
