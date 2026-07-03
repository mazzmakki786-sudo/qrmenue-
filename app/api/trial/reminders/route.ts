import { NextResponse } from "next/server"
import { checkAndSendTrialReminders } from "@/lib/email/trialReminderAlert"

export const GET = async (request: Request) => {
  const authHeader = request.headers.get("authorization")
  const queryToken = new URL(request.url).searchParams.get("token")
  const croneKey = process.env.CRON_SECRET

  if (croneKey && authHeader !== `Bearer ${croneKey}` && queryToken !== croneKey) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const result = await checkAndSendTrialReminders()
  return NextResponse.json(result)
}
