# CINEMA — Next.js + Firebase
`npm install && npm run dev` · `npm test` (Vitest, 56 pruebas) · `npm run build`

## Estado de las reservas online
Las reservas **solo se activan** cuando hay (1) credenciales de Firebase y (2) horarios verificados de al menos un servicio. Mientras falte algo, la web lo dice (`/api/booking-status`), no muestra huecos y **nunca confirma una reserva**. Una reserva se confirma únicamente cuando la API responde `201` tras cerrar la transacción en Firestore.

### Para activarlas
1. Proyecto Firebase con Firestore (modo producción) y Authentication (correo/contraseña).
2. `firebase deploy --only firestore:rules` (las reglas deniegan todo acceso de cliente; solo el servidor escribe con Admin SDK).
3. Variables en Vercel (ver `.env.example`): `FIREBASE_SERVICE_ACCOUNT` (JSON en una línea), `NEXT_PUBLIC_FIREBASE_*`, `RATE_LIMIT_SALT` (cadena aleatoria larga), `NEXT_PUBLIC_SITE_URL`.
4. Usuario admin con claim: `admin.auth().setCustomUserClaims(uid, { admin: true })`.
5. En `src/config/restaurant.ts`: horarios reales de `comida` y `cena`, aforo por turno (`capacityPerSlot`, hoy 20 PROVISIONAL), cierres (`closedDates`, `closedWeekdays`), teléfono y dirección.
6. Firestore → TTL: activar la política de expiración sobre el campo `expireAt` de la colección `ratelimit`.

## Cómo funciona (servidor)
- `GET /api/booking-status` — estado público (sin secretos). `GET /api/availability` — huecos reales: horario del servicio, día abierto, antelación (2 h / 60 días, hora Europe/Madrid) y aforo restante.
- `POST /api/reservations` — comprueba origen, tamaño, honeypot y esquema (zod, errores por campo); limita por IP (5/10 min) y correo (5/h) con hash; revalida el hueco; y crea la reserva en una transacción (aforo + idempotencia).
- Idempotencia: la clave (UUID) es el ID del documento. Mismo envío repetido → no duplica; misma clave con datos distintos → `409 KEY_CONFLICT`.
- Datos: `reservations/{id}`, `slots/{fecha_servicio_hhmm}`, `audit/*`, `ratelimit/*` (solo hashes). Nunca se guarda la IP en claro ni se registran datos personales en logs.

## Pendiente
Correos de confirmación (Resend), edición/creación manual en /admin, calendario, política de privacidad y textos legales, Playwright. Ver `src/config/restaurant.ts` para los datos sin verificar.
