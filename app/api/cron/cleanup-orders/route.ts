import { createAdminClient } from "@/lib/supabase/server"

export const runtime = "nodejs"

export async function GET(request: Request) {
  // Auth via header (Bearer token) or query param
  const authHeader = request.headers.get("authorization")
  const { searchParams } = new URL(request.url)
  const token = searchParams.get("token") || authHeader?.replace("Bearer ", "")
  if (process.env.CRON_SECRET && token !== process.env.CRON_SECRET) {
    return new Response("Unauthorized", { status: 401 })
  }

  const supabase = createAdminClient()

  // Call the cleanup function
  const { data, error } = await supabase.rpc("cleanup_old_orders")

  if (error) {
    console.error("Cleanup orders cron error:", error)
    return Response.json({ ok: false, error: error.message }, { status: 500 })
  }

  return Response.json({ ok: true, deleted: data })
}
