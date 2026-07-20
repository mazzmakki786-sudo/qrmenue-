import { NextResponse } from "next/server"
import { createClient, createAdminClient } from "@/lib/supabase/server"
import { isSuperAdmin, logAudit } from "@/lib/superadmin-security"
import { Resend } from "resend"
import { safeRoute } from "@/lib/api-error"
import { escapeHtml } from "@/lib/utils"
import { csrfGuard } from "@/lib/csrf"
import { sendPushNotification } from "@/lib/push-server"

export const POST = safeRoute(async (request, { params }: { params: Promise<{ id: string }> }) => {
  const csrfResponse = csrfGuard(request); if (csrfResponse) return csrfResponse

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !(await isSuperAdmin(user.email))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const { id } = await params
  const admin = createAdminClient()

  const { data: announcement, error: fetchError } = await admin
    .from("qr_announcements")
    .select("*")
    .eq("id", id)
    .single()

  if (fetchError || !announcement) {
    return NextResponse.json({ error: "Announcement not found" }, { status: 404 })
  }

  if (announcement.is_published) {
    return NextResponse.json({ error: "Already published" }, { status: 400 })
  }

  const { error: publishError } = await admin
    .from("qr_announcements")
    .update({ is_published: true })
    .eq("id", id)

  if (publishError) {
    return NextResponse.json({ error: "Failed to publish" }, { status: 500 })
  }

  const { data: authUsers } = await admin.auth.admin.listUsers()
  const userEmailMap = new Map((authUsers?.users || []).map((u: any) => [u.id, u.email]))

  const { data: restaurants } = await admin
    .from("restaurants")
    .select("id, owner_id, name")
    .eq("is_active", true)

  if (!restaurants) {
    await logAudit(user.email || "", "announcement_published", { id, notified: 0 })
    return NextResponse.json({ success: true, notified: 0 })
  }

  let emailNotified = 0
  let pushNotified = 0

  for (const r of restaurants) {
    // Always insert into owner_notifications for real-time in-app delivery
    try {
      await admin.from("owner_notifications").insert({
        restaurant_id: r.id,
        type: "announcement",
        title: announcement.title,
        body: announcement.body,
      })
    } catch {}

    // Send push notification to subscribed owners (works even when tab is backgrounded)
    try {
      const pushResult = await sendPushNotification(r.id, {
        title: "📢 " + announcement.title,
        body: announcement.body?.length > 120 ? announcement.body.slice(0, 120) + "…" : announcement.body || "",
        url: "/dashboard/announcements",
        tag: "announcement-" + id,
        icon: "/og-image.png",
      })
      pushNotified += pushResult.sent
    } catch {}

    // Send email notification if owner has an email
    const ownerEmail = userEmailMap.get(r.owner_id)
    if (!ownerEmail || !process.env.RESEND_API_KEY) continue

    try {
      const resend = new Resend(process.env.RESEND_API_KEY)
      await resend.emails.send({
        from: "Digital QR Menue <onboarding@resend.dev>",
        to: ownerEmail,
        subject: `Announcement: ${escapeHtml(announcement.title)}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
            <h1 style="font-size: 20px; color: #25D366;">${escapeHtml(announcement.title)}</h1>
            <div style="color: #555; font-size: 15px; line-height: 1.6; white-space: pre-wrap;">${escapeHtml(announcement.body)}</div>
            <hr style="margin-top: 24px; border: none; border-top: 1px solid #E8E8E8;" />
            <p style="color: #999; font-size: 13px;">Digital QR Menue — ${escapeHtml(r.name)}</p>
          </div>
        `,
      })
      emailNotified++
    } catch {}
  }

  await logAudit(user.email || "", "announcement_published", {
    id,
    emailNotified,
    pushNotified,
    total: restaurants.length,
  })

  return NextResponse.json({
    success: true,
    emailNotified,
    pushNotified,
    total: restaurants.length,
  })
})