import { beforeEach, describe, expect, it } from "vitest";
import { resetDbForTests } from "@/server/db";
import { productsRepo } from "@/server/repositories/products";
import { settingsRepo } from "@/server/repositories/settings";
import { seoPagesRepo } from "@/server/repositories/seo-pages";
import { enquiriesRepo } from "@/server/repositories/enquiries";
import { sessionsRepo, usersRepo } from "@/server/repositories/users";
import { hashPassword, verifyPassword } from "@/server/services/password";

beforeEach(() => resetDbForTests()); // fresh in-memory DB (DATABASE_PATH=:memory:)

describe("seeded database", () => {
  it("migrates and seeds legacy products in order", () => {
    const list = productsRepo.list();
    expect(list).toHaveLength(10);
    expect(list[0].slug).toBe("stone");
    expect(list[0].content.types.length).toBe(8);
    expect(settingsRepo.getSeo().siteName).toBe("ERA Interior Products");
  });
});

describe("productsRepo", () => {
  it("hides drafts from the public list and enforces slug uniqueness", () => {
    const p = productsRepo.getBySlug("ipe")!;
    productsRepo.update(p.id, { ...p, published: false });
    expect(productsRepo.getBySlug("ipe")).toBeNull();
    expect(productsRepo.getBySlug("ipe", { includeDrafts: true })).not.toBeNull();
    expect(productsRepo.slugTaken("stone")).toBe(true);
    expect(productsRepo.slugTaken("stone", productsRepo.getBySlug("stone")!.id)).toBe(false);
  });
});

describe("seoPagesRepo", () => {
  it("upserts and renames overrides", () => {
    seoPagesRepo.upsert({ path: "/products/ipe", title: "T", description: "", keywords: "", ogImage: "", canonical: "", noindex: true });
    seoPagesRepo.rename("/products/ipe", "/products/ipe-wood");
    expect(seoPagesRepo.get("/products/ipe")).toBeNull();
    expect(seoPagesRepo.get("/products/ipe-wood")?.noindex).toBe(true);
  });
});

describe("enquiriesRepo", () => {
  it("creates, counts and archives", () => {
    const id = enquiriesRepo.create({ name: "A", contact: "a@b.co", product: "", message: "hi", ip: "1" });
    expect(enquiriesRepo.countByStatus().new).toBe(1);
    enquiriesRepo.setStatus(id, "archived");
    expect(enquiriesRepo.list()).toHaveLength(0);
    expect(enquiriesRepo.list("archived")).toHaveLength(1);
  });
});

describe("auth storage", () => {
  it("hashes passwords and resolves sessions until expiry", async () => {
    const hash = await hashPassword("correct horse battery");
    expect(await verifyPassword("correct horse battery", hash)).toBe(true);
    expect(await verifyPassword("wrong", hash)).toBe(false);

    const uid = usersRepo.create("Admin@Example.com", "A", hash);
    expect(usersRepo.findByEmail("admin@example.com")?.id).toBe(uid); // case-insensitive
    sessionsRepo.create("h1", uid, new Date(Date.now() + 60_000));
    sessionsRepo.create("h2", uid, new Date(Date.now() - 1));
    expect(sessionsRepo.findUser("h1")?.id).toBe(uid);
    expect(sessionsRepo.findUser("h2")).toBeNull();
  });
});
