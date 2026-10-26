# CINEMA — Next.js + Firebase
`npm install && npm run dev` · `npm test` (Vitest). Nada de esto se ha ejecutado aún.
## Backend Firebase
1. Crea un proyecto Firebase con Firestore (modo producción) y Authentication (email/contraseña).
2. `firebase deploy --only firestore:rules` (las reglas deniegan todo acceso de cliente; solo el servidor escribe con Admin SDK).
3. Cuenta de servicio → JSON en una línea en `FIREBASE_SERVICE_ACCOUNT`; claves web en `NEXT_PUBLIC_FIREBASE_*` (ver `.env.example`).
4. Crea el usuario admin y dale el claim: `admin.auth().setCustomUserClaims(uid, { admin: true })`.
## Diseño de datos
`reservations/{idempotencyKey}` · `slots/{fecha_servicio_hhmm}` (comensales reservados) · `audit/*` (cancelaciones).
Crear/cancelar usan transacciones de Firestore: aforo y duplicados se validan de forma atómica.
## Pendiente
Horarios/teléfono/dirección/carta reales (`src/config/restaurant.ts`; capacidad 20 y cierres vacíos son PROVISIONALES; la antelación 2 h / 60 días está aplicada con hora Europe/Madrid), edición y creación manual en /admin, calendario, Resend, escenas/galería con fotos autorizadas, SEO, páginas legales, Playwright.
