import "server-only";
import { randomBytes } from "node:crypto";
import { mkdir, readdir, readFile, stat, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import type { MediaItem } from "@/types";

/** Uploaded images live next to the database (not in public/) so they survive rebuilds and are backed up together. */
// turbopackIgnore: runtime data dir – keep the bundler from tracing the whole project into the build.
const UPLOAD_DIR = path.resolve(/* turbopackIgnore: true */ process.cwd(), process.env.UPLOAD_DIR ?? "data/uploads");

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
export const UPLOAD_URL_PREFIX = "/uploads/";

const TYPES = {
  jpg: { mime: "image/jpeg", magic: (b: Buffer) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  png: { mime: "image/png", magic: (b: Buffer) => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) },
  webp: { mime: "image/webp", magic: (b: Buffer) => b.toString("ascii", 0, 4) === "RIFF" && b.toString("ascii", 8, 12) === "WEBP" },
  avif: { mime: "image/avif", magic: (b: Buffer) => b.toString("ascii", 4, 8) === "ftyp" && /^avi[fs]$/.test(b.toString("ascii", 8, 12)) },
} as const;
type Ext = keyof typeof TYPES;

/** Safe file names only: what saveImage generates. Blocks path traversal when serving. */
const NAME_RE = /^[a-z0-9-]{1,80}-[a-f0-9]{12}\.(jpg|png|webp|avif)$/;

/** Detects the real type from the file's bytes – the browser-provided type and extension are not trusted. */
export function detectImageType(bytes: Buffer): Ext | null {
  return (Object.keys(TYPES) as Ext[]).find((ext) => TYPES[ext].magic(bytes)) ?? null;
}

function baseName(original: string): string {
  const base = original.replace(/\.[^.]*$/, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);
  return base || "image";
}

export type UploadResult = { ok: true; path: string } | { ok: false; error: string };

export async function saveImage(file: File): Promise<UploadResult> {
  if (!file || file.size === 0) return { ok: false, error: "Choose an image to upload." };
  if (file.size > MAX_UPLOAD_BYTES) return { ok: false, error: "Image is too large – maximum 8 MB." };

  const bytes = Buffer.from(await file.arrayBuffer());
  const ext = detectImageType(bytes);
  if (!ext) return { ok: false, error: "Only JPG, PNG, WebP or AVIF images are allowed." };

  const name = `${baseName(file.name)}-${randomBytes(6).toString("hex")}.${ext}`;
  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(path.join(UPLOAD_DIR, name), bytes);
  return { ok: true, path: UPLOAD_URL_PREFIX + name };
}

const BUILT_IN_DIR = path.resolve(/* turbopackIgnore: true */ process.cwd(), "public/images");
const IMAGE_FILE = /\.(jpe?g|png|webp|avif)$/i;

async function scan(dir: string, keep: (f: string) => boolean, url: (f: string) => string, uploaded: boolean): Promise<MediaItem[]> {
  const files = await readdir(dir).catch(() => [] as string[]);
  const items = await Promise.all(
    files.filter(keep).map(async (f) => {
      const s = await stat(path.join(dir, f)).catch(() => null);
      return s?.isFile() ? { url: url(f), name: f, uploaded, modified: s.mtimeMs, size: s.size } : null;
    }),
  );
  return items.filter((i): i is MediaItem => i !== null);
}

/** Media library: admin uploads (newest first), then the site's built-in images. */
export async function listImages(): Promise<MediaItem[]> {
  const [uploads, builtIn] = await Promise.all([
    scan(UPLOAD_DIR, (f) => NAME_RE.test(f), (f) => UPLOAD_URL_PREFIX + f, true),
    scan(BUILT_IN_DIR, (f) => IMAGE_FILE.test(f), (f) => `/images/${f}`, false),
  ]);
  uploads.sort((a, b) => b.modified - a.modified);
  builtIn.sort((a, b) => a.name.localeCompare(b.name));
  return [...uploads, ...builtIn];
}

/** Deletes an admin-uploaded image by its public URL. Built-in site images can't be deleted. */
export async function deleteUpload(url: string): Promise<boolean> {
  const name = url.startsWith(UPLOAD_URL_PREFIX) ? url.slice(UPLOAD_URL_PREFIX.length) : "";
  if (!NAME_RE.test(name)) return false;
  try {
    await unlink(path.join(UPLOAD_DIR, name));
    return true;
  } catch {
    return false;
  }
}

export async function readUpload(name: string): Promise<{ bytes: Buffer; mime: string } | null> {
  if (!NAME_RE.test(name)) return null;
  try {
    const bytes = await readFile(path.join(UPLOAD_DIR, name));
    return { bytes, mime: TYPES[name.split(".").pop() as Ext].mime };
  } catch {
    return null;
  }
}
