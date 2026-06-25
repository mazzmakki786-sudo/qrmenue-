import { NextResponse } from "next/server"
import { safeRoute } from "@/lib/api-error"
import { createClient, createAdminClient } from "@/lib/supabase/server"
import { rateLimit, getClientIp } from "@/lib/rate-limiter"

export const GET = safeRoute(async (request) => {
  const ip = getClientIp(request)
  const allowed = await rateLimit(ip, 30, 60)
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  }

  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email?.toLowerCase() !== process.env.SUPER_ADMIN_EMAIL?.toLowerCase()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const supabaseAdmin = createAdminClient()

  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  // Use daily_order_stats materialized view for time-series data
  const { data: dailyStats } = await supabaseAdmin
    .from("daily_order_stats")
    .select("*")
    .order("order_date", { ascending: false })
    .limit(365)

  // Simple counts using server-side aggregation
  const { count: totalOrders } = await supabaseAdmin
    .from("orders")
    .select("id", { count: "exact", head: true })

  const { count: cancelledOrders } = await supabaseAdmin
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("order_status", "cancelled")

  const { count: completedOrders } = await supabaseAdmin
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("order_status", "completed")

  const { data: revenueResult } = await supabaseAdmin
    .from("orders")
    .select("total_price")
    .neq("order_status", "cancelled")

  const totalRevenue = revenueResult?.reduce((sum, r: any) => sum + (r.total_price || 0), 0) || 0

  const { count: totalCustomers } = await supabaseAdmin
    .from("customers")
    .select("id", { count: "exact", head: true })

  // Last 7 and 30 day orders (limited, targeted queries with date filters)
  const [last7Res, last30Res] = await Promise.all([
    supabaseAdmin
      .from("orders")
      .select("id, total_price, order_status, order_type, payment_status, created_at, restaurant_id, customer_id, customer_name, customer_phone")
      .gte("created_at", sevenDaysAgo.toISOString())
      .order("created_at", { ascending: false }),
    supabaseAdmin
      .from("orders")
      .select("id, total_price, order_status, order_type, payment_status, created_at, restaurant_id, customer_id, customer_name, customer_phone")
      .gte("created_at", thirtyDaysAgo.toISOString())
      .order("created_at", { ascending: false }),
  ])

  const last7 = last7Res.data || []
  const last30 = last30Res.data || []

  // Restaurants
  const { data: allRestaurants } = await supabaseAdmin
    .from("restaurants")
    .select("id, name, city, plan, plan_end_date, trial_end, is_active, image_upload_allowed, created_at")

  const { count: totalRestaurants } = await supabaseAdmin
    .from("restaurants")
    .select("id", { count: "exact", head: true })

  const { count: activeRestaurants } = await supabaseAdmin
    .from("restaurants")
    .select("id", { count: "exact", head: true })
    .eq("is_active", true)

  // Plan distribution
  const planData = allRestaurants || []
  const planDistribution: Record<string, number> = {}
  planData.forEach((r: any) => {
    planDistribution[r.plan] = (planDistribution[r.plan] || 0) + 1
  })

  // Customer registrations
  const { data: allCustomers } = await supabaseAdmin
    .from("customers")
    .select("id, created_at")

  const customers = allCustomers || []

  // Helper functions for the response structure
  const sumRevenue = (orders: any[]) =>
    orders.filter((o) => o.order_status !== "cancelled").reduce((s, o) => s + o.total_price, 0)

  const groupByDay = (orders: any[]) => {
    const map: Record<string, { date: string; orders: number; revenue: number }> = {}
    orders.forEach((o) => {
      const date = new Date(o.created_at).toISOString().slice(0, 10)
      if (!map[date]) map[date] = { date, orders: 0, revenue: 0 }
      map[date].orders += 1
      if (o.order_status !== "cancelled") map[date].revenue += o.total_price
    })
    return Object.values(map).sort((a, b) => a.date.localeCompare(b.date))
  }

  const groupByStatus = (orders: any[]) => {
    const map: Record<string, number> = {}
    orders.forEach((o) => { map[o.order_status] = (map[o.order_status] || 0) + 1 })
    return map
  }

  const groupByType = (orders: any[]) => {
    const map: Record<string, number> = {}
    orders.forEach((o) => { map[o.order_type] = (map[o.order_type] || 0) + 1 })
    return map
  }

  const uniqueCustomers7 = new Set(last7.map((o: any) => o.customer_id).filter(Boolean))
  const uniqueCustomers30 = new Set(last30.map((o: any) => o.customer_id).filter(Boolean))

  const newCustomers7 = customers.filter((c: any) =>
    new Date(c.created_at) >= sevenDaysAgo
  ).length
  const newCustomers30 = customers.filter((c: any) =>
    new Date(c.created_at) >= thirtyDaysAgo
  ).length

  // Customer purchase funnel from last30 orders (avoids loading all-time 20k rows)
  const customerOrderCount: Record<string, number> = {}
  last30.forEach((o: any) => {
    if (!o.customer_id) return
    customerOrderCount[o.customer_id] = (customerOrderCount[o.customer_id] || 0) + 1
  })
  const repeatCustomers = Object.values(customerOrderCount).filter((c) => c > 1).length
  const oneTimeCustomers = Object.values(customerOrderCount).filter((c) => c === 1).length

  const purchaseFunnel = {
    one_order: oneTimeCustomers,
    two_orders: Object.values(customerOrderCount).filter((c) => c === 2).length,
    three_plus: Object.values(customerOrderCount).filter((c) => c >= 3).length,
  }

  const groupRegistrationsByDay = (customers: any[]) => {
    const map: Record<string, number> = {}
    customers.forEach((c: any) => {
      const date = new Date(c.created_at).toISOString().slice(0, 10)
      map[date] = (map[date] || 0) + 1
    })
    return Object.entries(map)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))
  }

  const recentCustomers30 = customers.filter((c: any) =>
    new Date(c.created_at) >= thirtyDaysAgo
  )
  const recentCustomers7 = customers.filter((c: any) =>
    new Date(c.created_at) >= sevenDaysAgo
  )

  const nowISO = now.toISOString()
  const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString()

  const activeTrials = planData.filter((r: any) =>
    r.plan === "trial" && r.is_active && r.trial_end && r.trial_end > nowISO
  )
  const expiringSoonTrials = planData.filter((r: any) =>
    r.plan === "trial" && r.is_active && r.trial_end && r.trial_end > nowISO && r.trial_end <= threeDaysFromNow
  )
  const expiredTrials = planData.filter((r: any) =>
    r.plan === "trial" && r.trial_end && r.trial_end <= nowISO
  )
  const activeSubscriptions = planData.filter((r: any) =>
    r.plan !== "trial" && r.is_active
  )
  const inactiveRestaurants = planData.filter((r: any) => !r.is_active)

  // Count orders per restaurant for trial usage (only from last30 to avoid 20k load)
  const orderCountByRestaurant: Record<string, number> = {}
  last30.forEach((o: any) => {
    if (o.order_status === "cancelled") return
    orderCountByRestaurant[o.restaurant_id] = (orderCountByRestaurant[o.restaurant_id] || 0) + 1
  })
  const trialOrderUsage = activeTrials.slice(0, 10).map((r: any) => ({
    id: r.id,
    name: r.name,
    city: r.city,
    trial_end: r.trial_end,
    order_count: orderCountByRestaurant[r.id] || 0,
    max_orders: 10,
  }))

  const restaurantsByDay: Record<string, number> = {}
  planData.forEach((r: any) => {
    if (new Date(r.created_at) < thirtyDaysAgo) return
    const date = new Date(r.created_at).toISOString().slice(0, 10)
    restaurantsByDay[date] = (restaurantsByDay[date] || 0) + 1
  })
  const registrationsByDay = groupRegistrationsByDay(recentCustomers30)

  const restaurantMap = new Map(planData.map((r: any) => [r.id, r]))

  const ordersWithRestaurant = (orders: any[]) =>
    orders.map((o) => ({
      ...o,
      restaurant: restaurantMap.get(o.restaurant_id) || null,
    }))

  return NextResponse.json({
    allTime: {
      total: totalOrders ?? 0,
      revenue: totalRevenue,
      cancelled: cancelledOrders ?? 0,
      completed: completedOrders ?? 0,
    },
    last7: {
      total: last7.length,
      revenue: sumRevenue(last7),
      cancelled: last7.filter((o) => o.order_status === "cancelled").length,
      byDay: groupByDay(last7),
      byStatus: groupByStatus(last7),
      byType: groupByType(last7),
      recent: ordersWithRestaurant(last7.slice(0, 20)),
    },
    last30: {
      total: last30.length,
      revenue: sumRevenue(last30),
      cancelled: last30.filter((o) => o.order_status === "cancelled").length,
      byDay: groupByDay(last30),
      byStatus: groupByStatus(last30),
      byType: groupByType(last30),
    },
    customerFlow: {
      newCustomers7: recentCustomers7.length,
      newCustomers30: recentCustomers30.length,
      totalCustomers: customers.length,
      activeBuyers7: uniqueCustomers7.size,
      activeBuyers30: uniqueCustomers30.size,
      repeatCustomers,
      oneTimeCustomers,
      purchaseFunnel,
    },
    registrations: {
      total: customers.length,
      last7: recentCustomers7.length,
      last30: recentCustomers30.length,
      byDay: registrationsByDay,
    },
    restaurants: {
      total: planData.length,
      activeTrials: activeTrials.length,
      expiringSoonTrials: expiringSoonTrials.length,
      expiredTrials: expiredTrials.length,
      activeSubscriptions: activeSubscriptions.length,
      inactive: inactiveRestaurants.length,
      planDistribution,
      byDay: Object.entries(restaurantsByDay)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date)),
    },
    trialList: expiringSoonTrials.slice(0, 10),
    trialOrderUsage,
  })
})
