import { NextResponse } from "next/server"
import { z } from "zod"
import { safeRoute } from "@/lib/api-error"
import { sendPushNotification } from "@/lib/push-server"

const sendSchema = z.object({
  restaurant_id: z.string().uuid(),
  title: z.string().min(1),
  body: z.string().min(1),
  url: z.string().optional(),
  tag: z.string().optional(),
  icon: z.string().optional(),
})

export const POST = safeRoute(async (request) => {
  const body = await request.json()
  const parsed = sendSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }

  const result = await sendPushNotification(parsed.data.restaurant_id, {
    title: parsed.data.title,
    body: parsed.data.body,
    url: parsed.data.url,
    tag: parsed.data.tag,
    icon: parsed.data.icon,
  })

  return NextResponse.json(result)
})
