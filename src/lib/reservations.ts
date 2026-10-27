import { createHash } from "node:crypto";
import { FieldValue } from "firebase-admin/firestore";
import { db } from "./firebase-admin";
import { hasRoom } from "./availability";
import type { Reservation } from "./validation";
const slotId = (date: string, service: string, time: string) => `${date}_${service}_${time.replace(":", "")}`;
export async function bookedBySlot(date: string, service: string) {
  const d = db(); if (!d) return null;
  const snap = await d.collection("slots").where("date", "==", date).where("service", "==", service).get();
  return Object.fromEntries(snap.docs.map(s => [s.data().time as string, s.data().booked as number]));
}
// Transacción: comprueba aforo y escribe reserva + contador del turno de forma atómica.
// La reserva usa idempotencyKey como ID: un reenvío no duplica.
const fingerprint = (r: Omit<Reservation, "idempotencyKey">) => createHash("sha256").update(JSON.stringify([r.date, r.service, r.time, r.party, r.name, r.phone, r.email, r.notes ?? ""])).digest("hex");
export async function createReservation(r: Reservation) {
  const d = db(); if (!d) throw new Error("NO_BACKEND");
  const { idempotencyKey, ...data } = r;
  const fp = fingerprint(data);
  const resRef = d.collection("reservations").doc(idempotencyKey);
  const slotRef = d.collection("slots").doc(slotId(r.date, r.service, r.time));
  return d.runTransaction(async tx => {
    const [existing, slot] = await Promise.all([tx.get(resRef), tx.get(slotRef)]);
    if (existing.exists) { // reenvío con la misma clave: solo es "duplicado" si los datos son idénticos
      if (existing.data()!.fingerprint !== fp) throw new Error("KEY_CONFLICT");
      return { id: resRef.id, duplicate: true };
    }
    const booked = slot.exists ? (slot.data()!.booked as number) : 0;
    if (!hasRoom(booked, r.party)) throw new Error("FULL");
    tx.set(slotRef, { date: r.date, service: r.service, time: r.time, booked: booked + r.party });
    tx.set(resRef, { ...data, fingerprint: fp, status: "confirmed", createdAt: FieldValue.serverTimestamp() });
    return { id: resRef.id, duplicate: false };
  });
}
export async function cancelReservation(id: string, by: string) {
  const d = db(); if (!d) throw new Error("NO_BACKEND");
  const resRef = d.collection("reservations").doc(id);
  await d.runTransaction(async tx => {
    const res = await tx.get(resRef); if (!res.exists || res.data()!.status === "cancelled") return;
    const x = res.data()!; const slotRef = d.collection("slots").doc(slotId(x.date, x.service, x.time));
    const slot = await tx.get(slotRef);
    if (slot.exists) tx.update(slotRef, { booked: Math.max(0, (slot.data()!.booked as number) - x.party) });
    tx.update(resRef, { status: "cancelled", cancelledAt: FieldValue.serverTimestamp() });
    tx.set(d.collection("audit").doc(), { action: "cancel", reservationId: id, by, at: FieldValue.serverTimestamp() });
  });
}
