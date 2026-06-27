import { z } from "zod"

const htmlTagRegex = /<[^>]*>/g

export function sanitize(input: string): string {
  return input
    .replace(htmlTagRegex, "")
    .replace(/[<>"'&]/g, "")
    .trim()
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

export const citySchema = z
  .string()
  .min(1, { message: "Invalid input" })
  .max(50, { message: "Invalid input" })
  .transform(sanitize)

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, { message: "Invalid input" }).max(128, { message: "Invalid input" }),
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
  email: emailSchema,
  password: passwordSchema,
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
