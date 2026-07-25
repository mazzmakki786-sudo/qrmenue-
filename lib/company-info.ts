/**
 * Company information constants shared across policy pages, footer, etc.
 * These are used for ownership disclosure, operational hours, and permanent address.
 */
export const COMPANY_INFO = {
  name: "Digital QR Menue",
  owner: "Muhammad Muaz Maki",
  ownershipStatement:
    "DIGITAL MENUE IS OWNED AND OPERATED BY MUHAMMAD MUAZ MAKI",

  address: "Faisalabad, Punjab, Pakistan",

  hours: {
    weekday: "Monday – Friday: 9:00 AM – 6:00 PM",
    saturday: "Saturday: 9:00 AM – 2:00 PM",
    sunday: "Sunday: Closed",
    full: [
      "Monday – Friday: 9:00 AM – 6:00 PM",
      "Saturday: 9:00 AM – 2:00 PM",
      "Sunday: Closed",
    ],
  },

  support: {
    whatsapp: "+92-314-6325823",
    email: "maki2@gmail.com",
  },

  founding: {
    year: "2024",
    location: "Faisalabad, Pakistan",
  },
} as const

/** Convenience: business-hours line for inline display (hero / contact card). */
export function hoursSummary(): string {
  return COMPANY_INFO.hours.full.join(" | ")
}
