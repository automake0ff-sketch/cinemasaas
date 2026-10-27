// Doble en memoria de Firestore con transacciones (lecturas antes de escrituras, aplicadas al final).
export function fakeFirestore() {
  const store = new Map<string, Record<string, unknown>>(); let auto = 0;
  const ref = (c: string, id: string) => ({ path: `${c}/${id}`, id });
  const fake = {
    store,
    collection: (c: string) => ({
      doc: (id = `auto${++auto}`) => ref(c, id),
      where: (f: string, _o: string, v: unknown) => ({ where: (f2: string, _o2: string, v2: unknown) => ({ get: async () => ({ docs: [...store.entries()].filter(([p, d]) => p.startsWith(`${c}/`) && d[f] === v && d[f2] === v2).map(([, d]) => ({ data: () => d })) }) }) }),
    }),
    async runTransaction<T>(fn: (tx: unknown) => Promise<T>): Promise<T> {
      const writes: (() => void)[] = [];
      const tx = {
        get: async (r: { path: string }) => ({ exists: store.has(r.path), data: () => store.get(r.path) }),
        set: (r: { path: string }, d: Record<string, unknown>) => writes.push(() => store.set(r.path, d)),
        update: (r: { path: string }, d: Record<string, unknown>) => writes.push(() => store.set(r.path, { ...store.get(r.path), ...d })),
      };
      const out = await fn(tx); writes.forEach(w => w()); return out;
    },
  };
  return fake;
}
