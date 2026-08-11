import { z } from "zod"

const htmlTagRegex = /<[^>]*>/g

export function sanitize(input: string): string {
  return input
    .replace(htmlTagRegex, "")
    .replace(/[<>"'&]/g, "")
    .trim()
}

/**
 * Normalize a phone number to a single canonical form (11-digit Pakistan
 * national format starting with 0, e.g. "0311-9998877", "0311 9998877",
 * "+92 311 9998877", "92 311 9998877" all → "03119998877").
 *
 * Handles: dashes/spaces/parens, the "+92"/"92" country code, and the
 * international "3XX..." form without the leading 0. Storing and looking up
 * by this canonical form means the same number always maps to one account.
 */
export function normalizePhone(input: string): string {
  let digits = String(input ?? "").replace(/\D/g, "")
  // Strip Pakistan country code "92" (from "+92 ..." or "92 ...")
  if (digits.startsWith("92") && digits.length === 12) {
    digits = digits.slice(2)
  }
  // International form without leading 0: "3XXXXXXXXX" → "03XXXXXXXXX"
  if (digits.length === 10 && digits.startsWith("3")) {
    digits = "0" + digits
  }
  return digits
}

export const emailSchema = z
  .string()
  .min(1)
  .max(254)
  .email()
  .transform(sanitize)

export const passwordSchema = z
  .string()
  .min(6, { message: "Invalid input" })
  .max(128, { message: "Invalid input" })
  .regex(/[a-z]/, { message: "Invalid input" })
  .regex(/[A-Z]/, { message: "Invalid input" })
  .regex(/[0-9]/, { message: "Invalid input" })
  .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?`~]/, { message: "Invalid input" })

export const nameSchema = z
  .string()
  .min(1, { message: "Invalid input" })
  .max(100, { message: "Invalid input" })
  .transform(sanitize)

export const phoneSchema = z
  .string()
  .min(1, { message: "Invalid input" })
  .max(20, { message: "Invalid input" })
  .regex(/^[0-9+\-\s()]+$/, { message: "Invalid input" })
  .transform(sanitize)
  .transform(normalizePhone)

export const citySchema = z
  .string()
  .min(1, { message: "Invalid input" })
  .max(50, { message: "Invalid input" })
  .transform(sanitize)

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, { message: "Invalid input" }).max(128, { message: "Invalid input" }),
})

// Superadmin "Add Owner" flow — phone/city are optional in the modal, so they
// must not be required here. Name/email/password remain required.
export const superadminAddOwnerSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  phone: phoneSchema.optional().or(z.literal("")),
  city: citySchema.optional().or(z.literal("")),
})

export const restaurantSignupSchema = z.object({
  name: nameSchema,
  city: citySchema,
  phone: phoneSchema,
  email: emailSchema,
  password: passwordSchema,
})

export const customerSignupSchema = z.object({
  name: nameSchema,
  phone: phoneSchema,
  password: passwordSchema,
})

export const customerLoginSchema = z.object({
  phone: phoneSchema,
  password: z.string().min(1, { message: "Invalid input" }).max(128, { message: "Invalid input" }),
})

export function logValidationFailure(endpoint: string, issues: z.ZodIssue[], body: unknown): void {
  const sanitized = {
    timestamp: new Date().toISOString(),
    endpoint,
    issues: issues.map((i) => ({ path: i.path.join("."), code: i.code })),
    hasBody: !!body,
  }
  console.warn("[Auth Validation]", JSON.stringify(sanitized))
}
