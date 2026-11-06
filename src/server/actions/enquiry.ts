"use server";

import { contactSchema, fieldErrors, formObject, type FormState } from "@/lib/validation";
import { enquiriesRepo } from "../repositories/enquiries";
import { clientIp, hit } from "../services/rate-limit";

export async function submitEnquiry(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = contactSchema.safeParse(formObject(formData));
  if (!parsed.success) {
    // Honeypot filled → pretend success so bots learn nothing.
    if (parsed.error.issues.some((i) => i.path[0] === "website")) return { ok: true, message: "Thank you! We will get back to you soon." };
    return { errors: fieldErrors(parsed.error), message: "Please check the highlighted fields." };
  }

  const ip = await clientIp();
  if (!hit(`enquiry:${ip}`, 5, 60 * 60 * 1000).allowed) {
    return { message: "Too many enquiries from your network. Please call us instead." };
  }

  const { name, contact, product, message } = parsed.data;
  enquiriesRepo.create({ name, contact, product, message, ip });
  return { ok: true, message: "Thank you! Your enquiry has been received – we will get back to you soon." };
}
