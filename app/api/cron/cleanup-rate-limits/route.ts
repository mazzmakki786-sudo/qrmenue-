import { createAdminClient } from "@/lib/supabase/server"

export const runtime = "nodejs"

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 })
  }

  const supabase = createAdminClient()
  const cutoff = new Date(Date.now() - 120_000).toISOString()

  const { count, error } = await supabase
    .from("rate_limits")
    .delete()
    .lt("window_start", cutoff)

  if (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 })
  }

  return Response.json({ ok: true, deleted: count ?? 0 })
}
