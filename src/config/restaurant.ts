// Datos comerciales centralizados. null = PENDIENTE de verificar con el negocio.
export const restaurant = {
  name: "Cinema", city: "Dos Hermanas", timezone: "Europe/Madrid",
  phone: null as string | null, address: null as string | null,
  officialUrl: "https://www.restaurantecinema.com/",
  services: { comida: { open: null as string | null, close: null as string | null }, cena: { open: null as string | null, close: null as string | null } },
  slotMinutes: 30, capacityPerSlot: 20 /* PROVISIONAL: confirmar con el negocio */, minParty: 1, maxParty: 10, minAdvanceHours: 2, maxAdvanceDays: 60, closedDates: [] as string[] /* PENDIENTE: festivos y cierres reales */, closedWeekdays: [] as number[] /* PENDIENTE: 0=domingo */,
  menu: [] as { name: string; description: string; price: number; allergens?: string[] }[], // sin platos inventados
};
