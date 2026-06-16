import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { rateLimit, getClientIp } from "@/lib/rate-limiter"
import { csrfGuard } from "@/lib/csrf"
import { safeRoute } from "@/lib/api-error"
import { logOwnerAction, getIpSimple } from "@/lib/owner-audit"

const VALID_STATUSES = ["received", "preparing", "ready", "completed", "cancelled"] as const
const VALID_PAYMENT_STATUSES = ["pending", "paid", "failed"] as const
const VALID_PAYMENT_METHODS = ["cod", "bank_transfer", "jazzcash", "easypaisa"] as const

export const GET = safeRoute(async (
  _request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle()

  if (!restaurant) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .eq("restaurant_id", restaurant.id)
    .single()

  if (error) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 })
  }

  return NextResponse.json({ order: data })
})

export const PATCH = safeRoute(async (
  request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const csrfResponse = csrfGuard(request)
  if (csrfResponse) return csrfResponse

  const ip = getClientIp(request)
  const allowed = await rateLimit(ip, 10, 60)
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  }

  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle()

  if (!restaurant) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  let body: any
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const safeBody: Record<string, unknown> = {}

  if (body.order_status !== undefined) {
    if (!VALID_STATUSES.includes(body.order_status)) {
      return NextResponse.json({ error: `Invalid order_status. Must be one of: ${VALID_STATUSES.join(", ")}` }, { status: 400 })
    }
    safeBody.order_status = body.order_status
  }

  if (body.payment_status !== undefined) {
    if (!VALID_PAYMENT_STATUSES.includes(body.payment_status)) {
      return NextResponse.json({ error: `Invalid payment_status. Must be one of: ${VALID_PAYMENT_STATUSES.join(", ")}` }, { status: 400 })
    }
    safeBody.payment_status = body.payment_status
  }

  if (body.payment_method !== undefined) {
    if (!VALID_PAYMENT_METHODS.includes(body.payment_method)) {
      return NextResponse.json({ error: `Invalid payment_method. Must be one of: ${VALID_PAYMENT_METHODS.join(", ")}` }, { status: 400 })
    }
    safeBody.payment_method = body.payment_method
  }

  if (Object.keys(safeBody).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 })
  }

  const { data, error } = await supabase
    .from("orders")
    .update(safeBody)
    .eq("id", id)
    .eq("restaurant_id", restaurant.id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  logOwnerAction(restaurant.id, user.id, "order_updated", {
    order_id: id,
    changes: safeBody,
  }, getIpSimple(request)).catch(() => {})

  return NextResponse.json({ order: data })
})