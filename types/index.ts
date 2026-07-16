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
  brand_primary_color: string | null
  brand_accent_color: string | null
  banner_enabled: boolean | null
  banner_image_url: string | null
  banner_link_url: string | null
  created_at: string
  updated_at: string
  rating?: number
  review_count?: number
  is_open: boolean
  opening_time: string | null
  closing_time: string | null
  delivery_fee: number | null
  delivery_time_min: number | null
  opening_hours?: string
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
  rating?: number
  review_count?: number
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

export interface RestaurantTable {
  id: string
  restaurant_id: string
  table_number: string
  capacity: number
  is_active: boolean
  created_at: string
  updated_at: string
}

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
  table_id: string | null
  delivery_address: string | null
  payment_method: PaymentMethod
  payment_status: PaymentStatus
  order_status: OrderStatus
  prepared_at: string | null
  ready_at: string | null
  whatsapp_sent: boolean
  email_sent: boolean
  deal_id: string | null
  discount_amount: number
  created_at: string
  updated_at: string
}

export interface Subscription {
  id: string
  restaurant_id: string
  plan: "trial" | "starter" | "growth" | "premium"
  amount_pkr: number
  payment_method: string | null
  payment_ref: string | null
  transaction_ref: string | null
  status: "pending" | "active" | "expired" | "cancelled" | "refunded"
  billing_interval: "monthly" | "yearly" | null
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

export type DealType = "percentage" | "flat" | "bundle"

export interface Deal {
  id: string
  restaurant_id: string
  dish_id: string | null
  title_en: string
  title_ur: string | null
  description_en: string | null
  description_ur: string | null
  deal_type: DealType
  deal_value: number
  start_date: string | null
  end_date: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface DealFormData {
  title_en: string
  title_ur?: string
  description_en?: string
  description_ur?: string
  dish_id?: string
  deal_type: DealType
  deal_value: number
  start_date?: string
  end_date?: string
  is_active?: boolean
}

export interface AiPost {
  id: string
  restaurant_id: string
  prompt: string
  language: string
  ratio: string
  caption: string | null
  image_url: string | null
  template_used: string | null
  settings: Record<string, unknown>
  created_at: string
  images?: AiPostImage[]
}

export interface AiPostImage {
  id: string
  ai_post_id: string
  dish_id: string
  image_url: string
  position: number
}

export interface ToastNotification {
  id: string
  type: "success" | "error" | "info" | "order"
  title: string
  message: string
  duration?: number
  sound?: boolean
  action?: { label: string; url: string }
  data?: Record<string, unknown>
}

export interface CustomerNotification {
  id: string
  customer_id: string
  order_id: string
  type: string
  title_en: string
  title_ur: string | null
  body_en: string | null
  body_ur: string | null
  data: Record<string, unknown>
  is_read: boolean
  created_at: string
}

export interface AiUsage {
  id: string
  restaurant_id: string
  month: string
  count: number
}
