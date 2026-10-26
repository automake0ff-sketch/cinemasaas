"use client";
import { useState } from "react";
export default function ReservationForm() {
  const [service, setService] = useState<"comida" | "cena">("comida");
  const [slots, setSlots] = useState<string[] | null>(null);
  const [msg, setMsg] = useState(""); const [busy, setBusy] = useState(false);
  const [key] = useState(() => crypto.randomUUID());
  async function load(s: "comida" | "cena") {
    setService(s); setMsg("");
    const f = document.forms[0]; const date = (f.elements.namedItem("date") as HTMLInputElement).value; const party = (f.elements.namedItem("party") as HTMLInputElement).value;
    if (!date) { setMsg("Elige primero una fecha."); return; }
    const r = await fetch(`/api/availability?service=${s}&date=${date}&party=${party}`); const j = await r.json();
    if (!r.ok) { setSlots(null); setMsg(j.error); } else setSlots(j.slots);
  }
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); if (busy) return; setBusy(true);
    const f = new FormData(e.currentTarget);
    const r = await fetch("/api/reservations", { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: f.get("date"), service, party: Number(f.get("party")), time: f.get("time"), name: f.get("name"), phone: f.get("phone"), email: f.get("email"), notes: f.get("notes") || undefined, idempotencyKey: key }) });
    const j = await r.json(); setMsg(r.ok ? "Reserva confirmada." : j.error); setBusy(false);
  }
  const input = "w-full rounded border border-humo/40 bg-noche px-3 py-3 text-marfil focus:outline focus:outline-2 focus:outline-oro";
  return (
    <form onSubmit={submit} className="grid max-w-md gap-3" aria-busy={busy}>
      <label>Fecha<input name="date" type="date" required className={input} /></label>
      <div role="group" aria-label="Servicio" className="flex gap-2">
        {(["comida", "cena"] as const).map(s => <button type="button" key={s} onClick={() => load(s)} aria-pressed={service === s} className="flex-1 rounded border border-oro px-3 py-3 aria-pressed:bg-oro aria-pressed:text-carbon">{s}</button>)}
      </div>
      <label>Comensales<input name="party" type="number" min={1} max={10} defaultValue={2} required className={input} /></label>
      <label>Hora<select name="time" required className={input}>{(slots ?? []).map(t => <option key={t}>{t}</option>)}</select></label>
      <label>Nombre<input name="name" required className={input} /></label>
      <label>Teléfono<input name="phone" type="tel" required className={input} /></label>
      <label>Correo<input name="email" type="email" required className={input} /></label>
      <label>Observaciones<textarea name="notes" className={input} /></label>
      <button disabled={busy || !slots?.length} className="rounded bg-oro px-4 py-3 font-semibold text-carbon disabled:opacity-50">{busy ? "Enviando…" : "Reservar mesa"}</button>
      <p role="status" className="text-sm text-humo">{msg}</p>
    </form>
  );
}
