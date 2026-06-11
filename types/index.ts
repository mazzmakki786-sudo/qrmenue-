export interface Restaurant {
  id: string
  owner_id: string | null
  name: string
  name_ur: string | null
  slug: string
  phone: string | null
  city: string
  address: string | null
  logo_url: string | null
  cuisine_type: string | null
  language: string
  plan: "trial" | "starter" | "growth" | "premium"
  plan_start_date: string
  plan_end_date: string | null
  trial_start: string
  trial_end: string
  image_upload_allowed: boolean
  is_active: boolean
  is_suspended: boolean
  plan_limits_override: Record<string, number> | null
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  restaurant_id: string
  name_en: string
  name_ur: string | null
  sort_order: number
  created_at: string
}

export interface Dish {
  id: string
  restaurant_id: string
  category_id: string | null
  name_en: string
  name_ur: string | null
  description_en: string | null
  description_ur: string | null
  price: number
  image_url: string | null
  is_available: boolean
  sort_order: number
  tags: string[]
  created_at: string
  updated_at: string
}

export interface Customer {
  id: string
  name: string | null
  phone: string | null
  email: string | null
  city: string | null
  created_at: string
  last_login: string | null
}

export interface OrderItem {
  dish_id: string
  name_en: string
  name_ur?: string
  price: number
  quantity: number
  subtotal: number
}

export type OrderType = "dine_in" | "takeaway" | "delivery"
export type OrderStatus = "received" | "preparing" | "ready" | "completed" | "cancelled"
export type PaymentMethod = "cod" | "bank_transfer" | "jazzcash" | "easypaisa"
export type PaymentStatus = "pending" | "paid" | "failed"

export interface Order {
  id: string
  restaurant_id: string
  customer_id: string | null
  order_number: string
  items: OrderItem[]
  total_price: number
  order_type: OrderType
  customer_name: string
  customer_phone: string | null
  table_number: string | null
  delivery_address: string | null
  payment_method: PaymentMethod
  payment_status: PaymentStatus
  order_status: OrderStatus
  whatsapp_sent: boolean
  email_sent: boolean
  created_at: string
  updated_at: string
}

export interface Subscription {
  id: string
  restaurant_id: string
  plan: string
  amount_pkr: number
  payment_method: string | null
  payment_ref: string | null
  start_date: string
  end_date: string | null
  activated_by: string | null
  notes: string | null
  created_at: string
}

export interface CompanySetting {
  id: string
  key: string
  value: string
  updated_at: string
}

export interface CartItem {
  dish: Dish
  quantity: number
}

export interface DailyStats {
  restaurant_id: string
  order_date: string
  total_orders: number
  total_revenue: number
  unique_customers: number
}

export interface MenuData {
  restaurant: Restaurant
  categories: (Category & { dishes: Dish[] })[]
}

export interface DashboardStats {
  today_orders: number
  today_revenue: number
  graph_7day: DailyStats[]
  graph_30day: DailyStats[]
  top_dishes: { name: string; count: number }[]
  recent_orders: Order[]
}
