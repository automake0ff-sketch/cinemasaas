import { NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";
import { verifyAdmin } from "@/lib/adminAuth";
import { cancelReservation } from "@/lib/reservations";
export async function GET(req: Request) {
  if (!(await verifyAdmin(req))) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const date = new URL(req.url).searchParams.get("date");
  let q: FirebaseFirestore.Query = db()!.collection("reservations");
  if (date) q = q.where("date", "==", date);
  const s = await q.limit(200).get();
  return NextResponse.json({ items: s.docs.map(d => ({ id: d.id, ...d.data(), createdAt: undefined })) });
}
export async function DELETE(req: Request) {
  const u = await verifyAdmin(req); if (!u) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const id = new URL(req.url).searchParams.get("id"); if (!id) return NextResponse.json({ error: "Falta id" }, { status: 400 });
  await cancelReservation(id, u.uid); return NextResponse.json({ ok: true });
}
