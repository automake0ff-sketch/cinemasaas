import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
function app() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) return null;
  try { return getApps()[0] ?? initializeApp({ credential: cert(JSON.parse(raw)) }); }
  catch { console.error("FIREBASE_SERVICE_ACCOUNT no es un JSON de cuenta de servicio válido"); return null; }
}
export const db = () => { const a = app(); return a ? getFirestore(a) : null; };
export const adminAuth = () => { const a = app(); return a ? getAuth(a) : null; };
