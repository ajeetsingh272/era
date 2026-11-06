import { describe, expect, it } from "vitest";
import { detectImageType, readUpload } from "@/server/services/uploads";

const bytes = (...parts: (number[] | string)[]) =>
  Buffer.concat(parts.map((p) => (typeof p === "string" ? Buffer.from(p, "ascii") : Buffer.from(p))));

describe("detectImageType", () => {
  it("recognises real image signatures", () => {
    expect(detectImageType(bytes([0xff, 0xd8, 0xff, 0xe0]))).toBe("jpg");
    expect(detectImageType(bytes([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))).toBe("png");
    expect(detectImageType(bytes("RIFF", [0, 0, 0, 0], "WEBPVP8 "))).toBe("webp");
    expect(detectImageType(bytes([0, 0, 0, 0x20], "ftypavif"))).toBe("avif");
  });

  it("rejects non-images even if renamed", () => {
    expect(detectImageType(bytes("<svg xmlns=..."))).toBeNull();
    expect(detectImageType(bytes("<?php echo 1; ?>"))).toBeNull();
    expect(detectImageType(bytes("GIF89a"))).toBeNull();
  });
});

describe("readUpload", () => {
  it("refuses unsafe file names", async () => {
    expect(await readUpload("../data/era.db")).toBeNull();
    expect(await readUpload("..%2Fera.db")).toBeNull();
    expect(await readUpload("photo.svg")).toBeNull();
  });
});
