import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
function app() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) return null;
  return getApps()[0] ?? initializeApp({ credential: cert(JSON.parse(raw)) });
}
export const db = () => { const a = app(); return a ? getFirestore(a) : null; };
export const adminAuth = () => { const a = app(); return a ? getAuth(a) : null; };
