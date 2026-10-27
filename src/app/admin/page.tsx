"use client";
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { clientAuth } from "@/lib/firebase-client";
type Item = { id: string; date: string; time: string; service: string; party: number; name: string; phone: string; status: string };
export default function Admin() {
  const [items, setItems] = useState<Item[]>([]); const [msg, setMsg] = useState(""); const [date, setDate] = useState("");
  const tok = () => clientAuth().currentUser!.getIdToken();
  async function load() {
    const r = await fetch(`/api/admin/reservations?date=${date}`, { headers: { Authorization: `Bearer ${await tok()}` } });
    const j = await r.json(); r.ok ? setItems(j.items) : setMsg(j.error);
  }
  async function login(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); const f = new FormData(e.currentTarget);
    try { await signInWithEmailAndPassword(clientAuth(), String(f.get("email")), String(f.get("pw"))); setMsg(""); await load(); } catch { setMsg("Credenciales no válidas"); }
  }
  async function cancel(id: string) { await fetch(`/api/admin/reservations?id=${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${await tok()}` } }); load(); }
  const inp = "rounded border border-humo/40 bg-noche px-3 py-2";
  return (
    <main className="mx-auto max-w-4xl p-6">
      <h1 className="font-serif text-3xl text-oro">Administración</h1>
      <form onSubmit={login} className="my-4 flex flex-wrap gap-2"><input name="email" type="email" aria-label="Correo" placeholder="correo" className={inp} /><input name="pw" type="password" aria-label="Contraseña" placeholder="contraseña" className={inp} /><button className="rounded bg-oro px-4 py-2 text-carbon">Entrar</button></form>
      <div className="mb-4 flex gap-2"><input type="date" aria-label="Fecha" value={date} onChange={e => setDate(e.target.value)} className={inp} /><button onClick={load} className="rounded border border-oro px-4 py-2">Filtrar</button></div>
      <p role="status" className="text-sm text-humo">{msg}</p>
      <ul className="divide-y divide-humo/20">{items.map(i => <li key={i.id} className="flex items-center justify-between py-3"><span><code>{i.id.slice(0, 8).toUpperCase()}</code> · {i.date} {i.time} · {i.service} · {i.party}p · {i.name} · {i.phone} · <b>{i.status}</b></span>{i.status !== "cancelled" && <button onClick={() => cancel(i.id)} className="text-sm text-oro underline">Cancelar</button>}</li>)}</ul>
    </main>
  );
}
