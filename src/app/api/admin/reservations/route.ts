import { NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";
import { verifyAdmin } from "@/lib/adminAuth";
import { cancelReservation } from "@/lib/reservations";
export async function GET(req: Request) {
  if (!(await verifyAdmin(req))) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const date = new URL(req.url).searchParams.get("date");
  const d = db(); if (!d) return NextResponse.json({ error: "Backend no configurado" }, { status: 503 });
  if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) return NextResponse.json({ error: "Fecha no válida" }, { status: 400 });
  let q: FirebaseFirestore.Query = d.collection("reservations");
  if (date) q = q.where("date", "==", date);
  const s = await q.limit(200).get();
  return NextResponse.json({ items: s.docs.map(d => ({ id: d.id, ...d.data(), createdAt: undefined, fingerprint: undefined })) }, { headers: { "Cache-Control": "no-store" } });
}
export async function DELETE(req: Request) {
  const u = await verifyAdmin(req); if (!u) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const id = new URL(req.url).searchParams.get("id"); if (!id) return NextResponse.json({ error: "Falta id" }, { status: 400 });
  await cancelReservation(id, u.uid); return NextResponse.json({ ok: true });
}
