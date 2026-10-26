import { getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// Inicialización perezosa: solo se ejecuta en el navegador, al usar el login.
export function clientAuth() {
  const app = getApps()[0] ?? initializeApp({ apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY, authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN, projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID });
  return getAuth(app);
}
