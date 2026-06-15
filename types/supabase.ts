export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      restaurants: {
        Row: {
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
          plan: string
          plan_start_date: string
          plan_end_date: string | null
          trial_start: string
          trial_end: string
          image_upload_allowed: boolean
          is_active: boolean
          is_suspended: boolean | null
          plan_limits_override: Json | null
          brand_primary_color: string | null
          brand_accent_color: string | null
          banner_enabled: boolean | null
          banner_image_url: string | null
          banner_link_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id?: string | null
          name: string
          name_ur?: string | null
          slug: string
          phone?: string | null
          city: string
          address?: string | null
          logo_url?: string | null
          cuisine_type?: string | null
          language?: string
          plan?: string
          plan_start_date?: string
          plan_end_date?: string | null
          trial_start?: string
          trial_end?: string
          image_upload_allowed?: boolean
          is_active?: boolean
          is_suspended?: boolean | null
          plan_limits_override?: Json | null
          brand_primary_color?: string | null
          brand_accent_color?: string | null
          banner_enabled?: boolean | null
          banner_image_url?: string | null
          banner_link_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string | null
          name?: string
          name_ur?: string | null
          slug?: string
          phone?: string | null
          city?: string
          address?: string | null
          logo_url?: string | null
          cuisine_type?: string | null
          language?: string
          plan?: string
          plan_start_date?: string
          plan_end_date?: string | null
          trial_start?: string
          trial_end?: string
          image_upload_allowed?: boolean
          is_active?: boolean
          is_suspended?: boolean | null
          plan_limits_override?: Json | null
          brand_primary_color?: string | null
          brand_accent_color?: string | null
          banner_enabled?: boolean | null
          banner_image_url?: string | null
          banner_link_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          restaurant_id: string
          name_en: string
          name_ur: string | null
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          restaurant_id: string
          name_en: string
          name_ur?: string | null
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          restaurant_id?: string
          name_en?: string
          name_ur?: string | null
          sort_order?: number
          created_at?: string
        }
      }
      dishes: {
        Row: {
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
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          restaurant_id: string
          category_id?: string | null
          name_en: string
          name_ur?: string | null
          description_en?: string | null
          description_ur?: string | null
          price: number
          image_url?: string | null
          is_available?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          restaurant_id?: string
          category_id?: string | null
          name_en?: string
          name_ur?: string | null
          description_en?: string | null
          description_ur?: string | null
          price?: number
          image_url?: string | null
          is_available?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
      }
      customers: {
        Row: {
          id: string
          name: string | null
          phone: string | null
          email: string | null
          city: string | null
          created_at: string
          last_login: string | null
        }
        Insert: {
          id: string
          name?: string | null
          phone?: string | null
          email?: string | null
          city?: string | null
          created_at?: string
          last_login?: string | null
        }
        Update: {
          id?: string
          name?: string | null
          phone?: string | null
          email?: string | null
          city?: string | null
          created_at?: string
          last_login?: string | null
        }
      }
      orders: {
        Row: {
          id: string
          restaurant_id: string
          customer_id: string | null
          order_number: string
          items: Json
          total_price: number
          order_type: string
          customer_name: string
          customer_phone: string | null
          table_number: string | null
          delivery_address: string | null
          payment_method: string
          payment_status: string
          order_status: string
          whatsapp_sent: boolean
          email_sent: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          restaurant_id: string
          customer_id?: string | null
          order_number: string
          items: Json
          total_price: number
          order_type: string
          customer_name: string
          customer_phone?: string | null
          table_number?: string | null
          delivery_address?: string | null
          payment_method?: string
          payment_status?: string
          order_status?: string
          whatsapp_sent?: boolean
          email_sent?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          restaurant_id?: string
          customer_id?: string | null
          order_number?: string
          items?: Json
          total_price?: number
          order_type?: string
          customer_name?: string
          customer_phone?: string | null
          table_number?: string | null
          delivery_address?: string | null
          payment_method?: string
          payment_status?: string
          order_status?: string
          whatsapp_sent?: boolean
          email_sent?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      subscriptions: {
        Row: {
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
        Insert: {
          id?: string
          restaurant_id: string
          plan: string
          amount_pkr: number
          payment_method?: string | null
          payment_ref?: string | null
          start_date?: string
          end_date?: string | null
          activated_by?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          restaurant_id?: string
          plan?: string
          amount_pkr?: number
          payment_method?: string | null
          payment_ref?: string | null
          start_date?: string
          end_date?: string | null
          activated_by?: string | null
          notes?: string | null
          created_at?: string
        }
      }
      company_settings: {
        Row: {
          id: string
          key: string
          value: string
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          value: string
          updated_at?: string
        }
        Update: {
          id?: string
          key?: string
          value?: string
          updated_at?: string
        }
      }
      notification_logs: {
        Row: {
          id: string
          restaurant_id: string | null
          order_id: string | null
          type: string
          recipient_email: string | null
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          restaurant_id?: string | null
          order_id?: string | null
          type: string
          recipient_email?: string | null
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          restaurant_id?: string | null
          order_id?: string | null
          type?: string
          recipient_email?: string | null
          status?: string
          created_at?: string
        }
      }
    }
    Views: {
      daily_order_stats: {
        Row: {
          restaurant_id: string | null
          order_date: string | null
          total_orders: number | null
          total_revenue: number | null
          unique_customers: number | null
        }
      }
    }
    Functions: {
      refresh_daily_stats: {
        Args: Record<string, never>
        Returns: void
      }
    }
  }
}
