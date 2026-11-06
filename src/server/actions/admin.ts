"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  aboutContentSchema,
  homeContentSchema,
  pageFormSchema,
  businessSchema,
  fieldErrors,
  formObject,
  pageSeoSchema,
  productFormSchema,
  seoSettingsSchema,
  type FormState,
} from "@/lib/validation";
import { productsRepo } from "../repositories/products";
import { pagesRepo } from "../repositories/pages";
import { settingsRepo } from "../repositories/settings";
import { seoPagesRepo } from "../repositories/seo-pages";
import { enquiriesRepo } from "../repositories/enquiries";
import { requireAdmin } from "../services/auth";
import { deleteUpload, listImages, saveImage, type UploadResult } from "../services/uploads";
import { imageUsage } from "../services/media";
import { tx } from "../db";
import type { EnquiryStatus, MediaItem } from "@/types";

/** Content is cached/static on the public site – refresh everything after an edit. */
const refreshSite = () => revalidatePath("/", "layout");
const SAVED: FormState = { ok: true, message: "Saved. Changes are live on the website." };

/* ---------- Images ---------- */

/** Stores an uploaded image and returns its public path; the form then saves that path as usual. */
export async function uploadImage(formData: FormData): Promise<UploadResult> {
  await requireAdmin();
  const file = formData.get("file");
  if (!(file instanceof File)) return { ok: false, error: "Choose an image to upload." };
  return saveImage(file);
}

/** Images for the admin media picker. */
export async function listMedia(): Promise<MediaItem[]> {
  await requireAdmin();
  return listImages();
}

/** Deletes an uploaded image – refused while any page still uses it, so nothing on the site breaks. */
export async function deleteMedia(url: string): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  const usedIn = imageUsage().get(url);
  if (usedIn?.length) return { ok: false, error: `Still used in: ${usedIn.join(", ")}. Replace it there first.` };
  if (!(await deleteUpload(url))) return { ok: false, error: "Only images you uploaded can be deleted." };
  revalidatePath("/admin/media");
  return { ok: true };
}

/* ---------- Products ---------- */

export async function saveProduct(id: number | null, _prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = productFormSchema.safeParse(formObject(formData));
  if (!parsed.success) return { errors: fieldErrors(parsed.error), message: "Please fix the highlighted fields." };

  const input = parsed.data;
  if (productsRepo.slugTaken(input.slug, id ?? undefined)) return { errors: { slug: "Another product already uses this URL slug" } };

  let newId = id;
  tx(() => {
    if (id) {
      const before = productsRepo.getById(id);
      productsRepo.update(id, input);
      // Keep the product's SEO override attached when its URL changes.
      if (before && before.slug !== input.slug) seoPagesRepo.rename(`/products/${before.slug}`, `/products/${input.slug}`);
    } else {
      newId = productsRepo.create(input);
    }
  });
  refreshSite();
  if (!id) redirect(`/admin/products/${newId}?created=1`);
  return SAVED;
}

export async function deleteProduct(id: number) {
  await requireAdmin();
  const p = productsRepo.getById(id);
  if (p) {
    tx(() => {
      productsRepo.delete(id);
      seoPagesRepo.delete(`/products/${p.slug}`);
    });
  }
  refreshSite();
  redirect("/admin/products");
}

/* ---------- Pages ---------- */

export async function saveHomeContent(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = homeContentSchema.safeParse(formObject(formData));
  if (!parsed.success) return { errors: fieldErrors(parsed.error), message: "Please fix the highlighted fields." };
  settingsRepo.saveHome(parsed.data);
  refreshSite();
  return SAVED;
}

export async function saveAboutContent(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = aboutContentSchema.safeParse(formObject(formData));
  if (!parsed.success) return { errors: fieldErrors(parsed.error), message: "Please fix the highlighted fields." };
  settingsRepo.saveAbout(parsed.data);
  refreshSite();
  return SAVED;
}

export async function savePage(id: number | null, _prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = pageFormSchema.safeParse(formObject(formData));
  if (!parsed.success) return { errors: fieldErrors(parsed.error), message: "Please fix the highlighted fields." };

  const input = parsed.data;
  if (pagesRepo.slugTaken(input.slug, id ?? undefined)) return { errors: { slug: "Another page already uses this address" } };

  let newId = id;
  tx(() => {
    if (id) {
      const before = pagesRepo.getById(id);
      pagesRepo.update(id, input);
      // Keep the page's SEO override attached when its URL changes.
      if (before && before.slug !== input.slug) seoPagesRepo.rename(`/${before.slug}`, `/${input.slug}`);
    } else {
      newId = pagesRepo.create(input);
    }
  });
  refreshSite();
  if (!id) redirect(`/admin/pages/${newId}?created=1`);
  return SAVED;
}

export async function deletePage(id: number) {
  await requireAdmin();
  const p = pagesRepo.getById(id);
  if (p) {
    tx(() => {
      pagesRepo.delete(id);
      seoPagesRepo.delete(`/${p.slug}`);
    });
  }
  refreshSite();
  redirect("/admin/pages");
}

/* ---------- Settings ---------- */

export async function saveBusiness(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = businessSchema.safeParse(formObject(formData));
  if (!parsed.success) return { errors: fieldErrors(parsed.error), message: "Please fix the highlighted fields." };
  settingsRepo.saveBusiness(parsed.data);
  refreshSite();
  return SAVED;
}

export async function saveSeoSettings(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = seoSettingsSchema.safeParse(formObject(formData));
  if (!parsed.success) return { errors: fieldErrors(parsed.error), message: "Please fix the highlighted fields." };
  settingsRepo.saveSeo(parsed.data);
  refreshSite();
  return SAVED;
}

export async function savePageSeo(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = pageSeoSchema.safeParse(formObject(formData));
  if (!parsed.success) return { errors: fieldErrors(parsed.error), message: "Please fix the highlighted fields." };
  seoPagesRepo.upsert(parsed.data);
  refreshSite();
  return SAVED;
}

export async function resetPageSeo(path: string) {
  await requireAdmin();
  seoPagesRepo.delete(path);
  refreshSite();
  redirect(`/admin/seo/pages/edit?path=${encodeURIComponent(path)}&reset=1`);
}

/* ---------- Enquiries ---------- */

const STATUSES: EnquiryStatus[] = ["new", "read", "archived"];

export async function setEnquiryStatus(id: number, status: EnquiryStatus) {
  await requireAdmin();
  if (!STATUSES.includes(status)) return;
  enquiriesRepo.setStatus(id, status);
  revalidatePath("/admin", "layout");
}

export async function deleteEnquiry(id: number) {
  await requireAdmin();
  enquiriesRepo.delete(id);
  revalidatePath("/admin", "layout");
}
