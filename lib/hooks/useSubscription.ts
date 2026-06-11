"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import {
  getSubscriptionStatus,
  PLAN_LIMITS,
  type Plan,
  type PlanLimits,
  type SubscriptionStatus,
} from "@/lib/subscription"
import type { Restaurant } from "@/types"

export interface UseSubscriptionReturn {
  restaurant: Restaurant | null
  plan: Plan
  status: SubscriptionStatus | null
  canAddDish: boolean
  canUploadImage: boolean
  canAddCategory: boolean
  canAcceptOrder: boolean
  shouldBlurOrderDetails: boolean
  isSuspended: boolean
  isExpired: boolean
  blockMenu: boolean
  blockOrders: boolean
  orderCount: number
  dishCount: number
  categoryCount: number
  imageCount: number
  planLimits: PlanLimits
  trialDaysRemaining: number
  loading: boolean
  refresh: () => Promise<void>
}

const EMPTY_LIMITS: PlanLimits = {
  maxDishes: 20,
  maxImages: 20,
  maxOrders: 10,
  maxCategories: 20,
  analytics: true,
  customBranding: false,
  canHaveQR: true,
  canHaveWhatsapp: true,
}

export function useSubscription(): UseSubscriptionReturn {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [dishCount, setDishCount] = useState(0)
  const [imageCount, setImageCount] = useState(0)
  const [orderCount, setOrderCount] = useState(0)
  const [categoryCount, setCategoryCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null)
  const getSupabase = () => {
    if (!supabaseRef.current) supabaseRef.current = createClient()
    return supabaseRef.current
  }

  const fetchAll = useCallback(async () => {
    try {
      const supabase = getSupabase()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      const { data: restaurantData, error: rErr } = await supabase
        .from("restaurants")
        .select("*")
        .eq("owner_id", user.id)
        .single()

      if (rErr || !restaurantData) {
        setLoading(false)
        return
      }

      setRestaurant(restaurantData as Restaurant)

      const [dishesRes, ordersRes, categoriesRes] = await Promise.all([
        supabase
          .from("dishes")
          .select("id, image_url", { count: "exact" })
          .eq("restaurant_id", restaurantData.id),
        supabase
          .from("orders")
          .select("id", { count: "exact", head: true })
          .eq("restaurant_id", restaurantData.id)
          .neq("order_status", "cancelled"),
        supabase
          .from("categories")
          .select("id", { count: "exact", head: true })
          .eq("restaurant_id", restaurantData.id),
      ])

      const dishes = dishesRes.data || []
      setDishCount(dishesRes.count ?? dishes.length ?? 0)
      setImageCount(dishes.filter((d: any) => !!d.image_url).length)
      setOrderCount(ordersRes.count ?? 0)
      setCategoryCount(categoriesRes.count ?? 0)
    } catch (e) {
      console.error("useSubscription fetch error", e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  useEffect(() => {
    if (!restaurant) return

    const supabase = getSupabase()
    const restaurantId = restaurant.id

    const debouncedRefetch = () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        fetchAll()
      }, 500)
    }

    const channel = supabase
      .channel(`subscription-${restaurantId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "restaurants",
          filter: `id=eq.${restaurantId}`,
        },
        debouncedRefetch
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "dishes",
          filter: `restaurant_id=eq.${restaurantId}`,
        },
        debouncedRefetch
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
          filter: `restaurant_id=eq.${restaurantId}`,
        },
        debouncedRefetch
      )
      .subscribe()

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      supabase.removeChannel(channel)
    }
  }, [restaurant?.id, fetchAll])

  const plan: Plan = (restaurant?.plan as Plan) || "trial"
  const status = restaurant
    ? getSubscriptionStatus(restaurant, { dishCount, imageCount, orderCount, categoryCount })
    : null
  const planLimits = PLAN_LIMITS[plan] || EMPTY_LIMITS

  return {
    restaurant,
    plan,
    status,
    canAddDish: status?.canAddDish ?? true,
    canUploadImage: status?.canUploadImages ?? true,
    canAddCategory: status?.canAddCategory ?? true,
    canAcceptOrder: status?.canAcceptOrder ?? true,
    shouldBlurOrderDetails: status?.shouldBlurOrderDetails ?? false,
    isSuspended: status?.isSuspended ?? false,
    isExpired: status?.isExpired ?? false,
    blockMenu: status?.blockMenu ?? false,
    blockOrders: status?.blockOrders ?? false,
    orderCount,
    dishCount,
    categoryCount,
    imageCount,
    planLimits,
    trialDaysRemaining: status?.trialDaysRemaining ?? 0,
    loading,
    refresh: fetchAll,
  }
}
