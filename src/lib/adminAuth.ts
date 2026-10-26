import { adminAuth } from "./firebase-admin";
// Requiere un usuario de Firebase Auth con custom claim { admin: true } (ver README).
export async function verifyAdmin(req: Request) {
  const a = adminAuth(); const t = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!a || !t) return null;
  try { const d = await a.verifyIdToken(t); return d.admin === true ? d : null; } catch { return null; }
}
