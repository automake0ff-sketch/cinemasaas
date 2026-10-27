import { beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("./firebase-admin", () => ({ db: () => null, adminAuth: () => null }));
import { hashId, hit, memHit, resetLimiter, sameOrigin } from "./security";
beforeEach(() => resetLimiter());
describe("limitador", () => {
  it("permite hasta el máximo y bloquea después, con retryAfter", () => { for (let i = 0; i < 3; i++) expect(memHit("k", 3, 60, 1000).ok).toBe(true); const r = memHit("k", 3, 60, 2000); expect(r.ok).toBe(false); expect(r.retryAfter).toBe(59); });
  it("se reinicia al acabar la ventana", () => { memHit("k", 1, 10, 0); expect(memHit("k", 1, 10, 1000).ok).toBe(false); expect(memHit("k", 1, 10, 11000).ok).toBe(true); });
  it("hit() sin backend usa memoria y no guarda el identificador en claro", async () => { for (let i = 0; i < 2; i++) expect((await hit("b", "1.2.3.4", 2, 60)).ok).toBe(true); expect((await hit("b", "1.2.3.4", 2, 60)).ok).toBe(false); expect(hashId("1.2.3.4")).not.toContain("1.2.3.4"); });
});
describe("sameOrigin", () => {
  const r = (h: Record<string, string>) => new Request("https://x.test/api", { method: "POST", headers: h });
  it("acepta el mismo host y rechaza otro o ausente", () => { expect(sameOrigin(r({ origin: "https://x.test", host: "x.test" }))).toBe(true); expect(sameOrigin(r({ origin: "https://evil.test", host: "x.test" }))).toBe(false); expect(sameOrigin(r({ host: "x.test" }))).toBe(false); });
});
