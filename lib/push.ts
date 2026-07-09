export function getVapidPublicKey(): string {
  return process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ""
}

export function getVapidPrivateKey(): string {
  return process.env.VAPID_PRIVATE_KEY || ""
}

export function getVapidSubject(): string {
  return process.env.VAPID_SUBJECT || "mailto:admin@qrmenu.pk"
}

export function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
}
